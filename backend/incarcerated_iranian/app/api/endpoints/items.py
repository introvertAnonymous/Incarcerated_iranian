from datetime import datetime
import json
from typing import List, Optional
from fastapi import APIRouter, Depends
from incarcerated_api.utils.twitter import (
    get_count_hist,
    get_query_hashtag,
    merge_tweet_hists,
)
from app.schemas.requests import ItemCondition
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.models import User
from incarcerated_api.pydantic_types import (
    CityDist,
    Item,
    ItemCreate,
    StatTerm,
    TweetHist,
)
from incarcerated_api.constants import ELASTIC_INDEX
from incarcerated_api.utils.elastic import get_es_client
from incarcerated_api.utils import get_uri, get_today


router = APIRouter()

es = get_es_client()


def get_search_query(search):
    return {
        "multi_match": {
            "query": search,
            "type": "bool_prefix",
            "fields": [
                "name.fa",
                "name.en",
                "name.fa._2gram",
                "name.en._3gram",
                "name.fa._index_prefix",
                "name.en._index_prefix",
            ],
            "operator": "or",
        }
    }


def get_filter_query(field, value):
    return {"term": {field: value}}


def get_status_filter_query(value):
    return get_filter_query("status.value", value)


def get_tag_filter_query(value):
    return get_filter_query("tags.keyword", value)


def merge_queries(queries, op="must"):
    if queries:
        return {"bool": {op: queries}}


def get_query_param(params):
    queries = []
    if search := params.search:
        queries.append(get_search_query(search))
    if status_filter := params.status_filter:
        queries.append(get_status_filter_query(status_filter))
    if tag_filter := params.tag_filter:
        queries.append(get_tag_filter_query(tag_filter))
    return merge_queries(queries)


@router.get("/item", response_model=Item)
async def get_item(
    uri: str,
    # current_user: User = Depends(deps.get_current_user),
    session: AsyncSession = Depends(deps.get_session),
):
    try:
        item = es.get(index="people", id=uri).body.get("_source")
        return Item.parse_obj(item)
    except Exception as e:
        return {"Error": str(e)}


@router.get("/next_item", response_model=Item)
async def get_item(
    uri: str,
    # current_user: User = Depends(deps.get_current_user),
    session: AsyncSession = Depends(deps.get_session),
):

    query = {"range": {"uri": {"gt": uri}}}
    sort = [{"uri": {"order": "asc"}}]
    try:
        item = (
            es.search(index="people", query=query, size=1, sort=sort)
            .body.get("hits", {})
            .get("hits", [{}])[0]
        )
        if item:
            return Item.parse_obj(item["_source"])
    except Exception as e:
        return {"Error": str(e)}


# @router.get("/items", response_model=List[Item])
@router.post("/items", response_model=List[Item])
async def get_items(
    size: int,
    params: Optional[ItemCondition] = ItemCondition(),
    # current_user: User = Depends(deps.get_current_user),
    session: AsyncSession = Depends(deps.get_session),
):
    if (sort := params.sort) and not params.search:
        if Item.__fields__[sort].type_ == str:
            sort += ".keyword"
        sort_key = [{sort: {"order": "asc" if params.asc else "desc"}}]
    else:
        sort_key = None
    query = get_query_param(params)
    selected = [
        d.get("_source")
        for d in es.search(
            index="people", size=size, from_=params.offset, sort=sort_key, query=query
        )
        .body.get("hits", {})
        .get("hits", [])
    ]
    items = [Item.parse_obj(f) for f in selected]
    return items


@router.get("/count", response_model=int)
@router.post("/count", response_model=int)
async def get_count_items(
    params: Optional[ItemCondition] = ItemCondition(),
    # current_user: User = Depends(deps.get_current_user),
    session: AsyncSession = Depends(deps.get_session),
):
    query = get_query_param(params)
    count = (
        es.search(
            index="people",
            size=0,
            query=query,
            aggregations={"count": {"value_count": {"field": "uri"}}},
        )
        .body.get("aggregations", {})
        .get("count", {})
        .get("value")
    )
    return count


@router.get("/stats", response_model=List[StatTerm])
async def get_status_stats(
    # current_user: User = Depends(deps.get_current_user),
    session: AsyncSession = Depends(deps.get_session),
):
    aggs = {"stats": {"terms": {"field": "status.value", "size": 5}}}
    data = es.search(index="people", size=0, aggregations=aggs)
    stats = data.body.get("aggregations", {}).get("stats", {}).get("buckets")
    return stats


@router.get("/tag_stats", response_model=List[StatTerm])
async def get_tag_stats(
    # current_user: User = Depends(deps.get_current_user),
    session: AsyncSession = Depends(deps.get_session),
):
    aggs = {"tags": {"terms": {"field": "tags.keyword", "size": 5}}}
    query = {"bool": {"must_not": [{"match": {"status.value": "آزاد شد"}}]}}
    data = es.search(index=ELASTIC_INDEX, size=0, aggregations=aggs, query=query)
    tags = data.body.get("aggregations", {}).get("tags", {}).get("buckets")
    return tags


@router.get("/city_dist", response_model=CityDist)
async def get_city_dist(
    # current_user: User = Depends(deps.get_current_user),
    session: AsyncSession = Depends(deps.get_session),
):
    aggs = {
        "prison": {
            "filter": {"bool": {"must": [{"match": {"status.value": "زندانی"}}]}},
            "aggs": {"stats": {"terms": {"field": "city.keyword", "size": 10}}},
        },
        "free": {
            "filter": {"bool": {"must": [{"match": {"status.value": "آزاد شد"}}]}},
            "aggs": {"stats": {"terms": {"field": "city.keyword", "size": 100}}},
        },
    }
    data = es.search(index="people", size=0, aggregations=aggs)
    prison = (
        data.body.get("aggregations", {})
        .get("prison", {})
        .get("stats", {})
        .get("buckets")
    )
    free = (
        data.body.get("aggregations", {})
        .get("free", {})
        .get("stats", {})
        .get("buckets")
    )
    free_dict = {f["key"]: f for f in free}
    free = [
        {"key": p["key"], "doc_count": free_dict.get(p["key"], {}).get("doc_count", 0)}
        for p in prison
    ]
    dist = {"prison": prison, "free": free}
    return dist


@router.post("/update", response_model=Item)
async def update_item(
    item: Item,
    current_user: User = Depends(deps.get_current_user),
    session: AsyncSession = Depends(deps.get_session),
):
    es.update(index="people", id=item.uri, doc=json.loads(item.json()))
    return item


@router.post("/update_tweet_hist", response_model=Item)
async def update_tweet_hist(
    uri: str,
    current_user: User = Depends(deps.get_current_user),
    session: AsyncSession = Depends(deps.get_session),
):
    data = es.get(index=ELASTIC_INDEX, id=uri).body["_source"]
    hashtag = get_query_hashtag(data)
    hists = get_count_hist(" ".join(hashtag.split()))
    data["recent_tweets_hist"] = merge_tweet_hists(
        (data.get("recent_tweets_hist") or []), hists
    )
    data["recent_tweets_count"] = sum(
        [d["tweet_count"] for d in data["recent_tweets_hist"]]
    )
    if data["recent_tweets_count"] > 0:
        hists = get_count_hist(hashtag, is_verified=True)
        data["recent_tweets_hist_verified"] = merge_tweet_hists(
            data.get("recent_tweets_hist_verified", []) or [], hists
        )
        data["recent_tweets_count_verified"] = sum(
            [
                d["tweet_count"]
                for d in data.get("recent_tweets_hist_verified", []) or []
            ]
        )
    data["last_updated"] = get_today()
    item = Item.parse_obj(data)
    es.update(
        index=ELASTIC_INDEX,
        id=item.uri,
        doc={
            key: data[key]
            for key in [
                "recent_tweets_hist",
                "recent_tweets_count",
                "recent_tweets_count_verified",
                "recent_tweets_hist_verified",
            ]
        },
    )
    return item


@router.post("/create", response_model=Item)
async def create_item(
    item: ItemCreate,
    current_user: User = Depends(deps.get_current_user),
    session: AsyncSession = Depends(deps.get_session),
):
    uri = get_uri(item.name.fa, item.city or "")
    item = Item.parse_obj({"uri": uri, "updated_at": datetime.now(), **item.dict()})
    hashtag = get_query_hashtag(item.dict())
    if len(hashtag) > 3:
        item.recent_tweets_hist = [
            TweetHist.parse_obj(d) for d in get_count_hist(hashtag)
        ]
        item.recent_tweets_count = sum([d.tweet_count for d in item.recent_tweets_hist])
        if item.recent_tweets_count:
            item.recent_tweets_hist_verified = [
                TweetHist.parse_obj(d)
                for d in get_count_hist(hashtag, is_verified=True)
            ]
            item.recent_tweets_count_verified = sum(
                [d["tweet_count"] for d in item.recent_tweets_hist_verified]
            )

    es.create(index=ELASTIC_INDEX, id=item.uri, document=json.loads(item.json()))
    return item


# @router.delete("/me", status_code=204)
# async def delete_current_user(
#     current_user: User = Depends(deps.get_current_user),
#     session: AsyncSession = Depends(deps.get_session),
# ):
#     """Delete current user"""
#     await session.execute(delete(User).where(User.id == current_user.id))
#     await session.commit()


# @router.post("/reset-password", response_model=UserResponse)
# async def reset_current_user_password(
#     user_update_password: UserUpdatePasswordRequest,
#     session: AsyncSession = Depends(deps.get_session),
#     current_user: User = Depends(deps.get_current_user),
# ):
#     """Update current user password"""
#     current_user.hashed_password = get_password_hash(user_update_password.password)
#     session.add(current_user)
#     await session.commit()
#     return current_user


# @router.post("/register", response_model=UserResponse)
# async def register_new_user(
#     new_user: UserCreateRequest,
#     session: AsyncSession = Depends(deps.get_session),
# ):
#     """Create new user"""
#     result = await session.execute(select(User).where(User.email == new_user.email))
#     if result.scalars().first() is not None:
#         raise HTTPException(status_code=400, detail="Cannot use this email address")
#     user = User(
#         email=new_user.email,
#         hashed_password=get_password_hash(new_user.password),
#     )
#     session.add(user)
#     await session.commit()
#     return user
