from datetime import datetime
import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.core.security import get_password_hash
from app.models import User
from app.schemas.requests import UserCreateRequest, UserUpdatePasswordRequest
from app.schemas.responses import UserResponse
from incarcerated_api.pydantic_types import CityDist, Item, ItemCreate, StatTerm
from incarcerated_api.constants import DATA_PATH, ELASTIC_INDEX
from incarcerated_api.utils.elastic import get_es_client
from incarcerated_api.utils import (
    convert_to_elastic,
    get_item as get_people_item,
    get_uri,
)
from incarcerated_api.utils import today


router = APIRouter()

es = get_es_client()


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


@router.get("/items", response_model=List[Item])
async def get_items(
    size: int,
    search: str = "",
    offset: int = 0,
    sort: str = None,
    asc: bool = True,
    # current_user: User = Depends(deps.get_current_user),
    session: AsyncSession = Depends(deps.get_session),
):
    sort_key = [{sort: {"order": "asc" if asc else "desc"}}] if sort else None
    query = None
    if search:
        query = {
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
    selected = [
        d.get("_source")
        for d in es.search(
            index="people", size=size, from_=offset, sort=sort_key, query=query
        )
        .body.get("hits", {})
        .get("hits", [])
    ]
    items = [Item.parse_obj(f) for f in selected]
    return items


@router.get("/count", response_model=int)
async def get_count_items(
    # current_user: User = Depends(deps.get_current_user),
    session: AsyncSession = Depends(deps.get_session),
):
    count = es.count(index="people").body.get("count")
    return count


@router.get("/stats", response_model=List[StatTerm])
async def get_count_items(
    # current_user: User = Depends(deps.get_current_user),
    session: AsyncSession = Depends(deps.get_session),
):
    aggs = {"stats": {"terms": {"field": "status.value", "size": 5}}}
    data = es.search(index="people", size=0, aggregations=aggs)
    stats = data.body.get("aggregations", {}).get("stats", {}).get("buckets")
    return stats


@router.get("/city_dist", response_model=CityDist)
async def get_count_items(
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


@router.post("/create", response_model=Item)
async def create_item(
    item: ItemCreate,
    current_user: User = Depends(deps.get_current_user),
    session: AsyncSession = Depends(deps.get_session),
):
    uri = get_uri(item.name.fa, item.city or "")
    item = Item.parse_obj({"uri": uri, "updated_at": datetime.now(), **item.dict()})
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
