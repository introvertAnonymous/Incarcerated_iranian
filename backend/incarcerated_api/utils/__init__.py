import json
import re
from datetime import datetime
from typing import Dict, List
import uuid
from incarcerated_api.enums import StatusEnum
from wikibaseintegrator import wbi_login, WikibaseIntegrator
from wikibaseintegrator.datatypes import Item as WikiItem, String, Quantity, Time, URL
from wikibaseintegrator.wbi_config import config as wbi_config
from wikibaseintegrator.wbi_enums import ActionIfExists
import tweepy
from incarcerated_api.constants import (
    WIKI_CLIENT_APPLICATION_KEY,
    WIKI_CLIENT_APPLICATION_SECRET,
    CONSUMER_KEY,
    CONSUMER_SECRET,
    ACCESS_TOKEN,
    ACCESS_TOKEN_SECRET,
    BEARER_TOKEN,
)
from incarcerated_api.pydantic_types import (
    Item,
    Label,
    SocialMdedia,
    WikidataItem,
    Status,
    Hashtag,
    TweetHist,
)
from incarcerated_api.constants import status_dict
import logging

spceial_utf_reg = re.compile("[\u200a-\uFFFF]+")
wbi_config[
    "USER_AGENT"
] = "MyWikibaseBot/1.0 (https://www.wikidata.org/wiki/User:IntrovertAnonymous)"
today = datetime.now().strftime("%Y-%m-%dT00:00:00Z")

try:
    login_instance = wbi_login.OAuth2(
        consumer_token=WIKI_CLIENT_APPLICATION_KEY,
        consumer_secret=WIKI_CLIENT_APPLICATION_SECRET,
    )

    wbi = WikibaseIntegrator(login=login_instance)
except:
    logging.warning("Could not load wikidata instace. You can't edit wikidata objects")

try:
    auth = tweepy.OAuth1UserHandler(
        CONSUMER_KEY, CONSUMER_SECRET, ACCESS_TOKEN, ACCESS_TOKEN_SECRET
    )
    tweepy_api = tweepy.API(auth)
    tweepy_client = tweepy.Client(
        BEARER_TOKEN,
        CONSUMER_KEY,
        CONSUMER_SECRET,
        ACCESS_TOKEN,
        ACCESS_TOKEN_SECRET,
        wait_on_rate_limit=True,
    )
except:
    logging.warning("Could not load tweepy. You can't get tweets")


def get_wikidata_item(wiki_id):
    wikidata_item = wbi.item.get(entity_id=wiki_id)
    return wikidata_item.get_json()


def get_wikidata_item_label(wiki_id, lang=None):
    wikidata_item = wbi.item.get(entity_id=wiki_id)
    if lang:
        return wikidata_item.labels.get(lang).get_json()
    else:
        return wikidata_item.labels.get_json()


def get_count_hist(hashtag: str, is_verified=False) -> List[Dict[str, str | int]]:
    query = f"{hashtag}"
    if is_verified:
        query += " is:verified"
    result = tweepy_client.get_recent_tweets_count(query, granularity="day")
    return result.data


def merge_tweet_hists(past, current):
    starts = [d["start"].split("T")[0] for d in past[:-1]]
    new_hists = []
    for h in current:
        if h["start"].split("T")[0] not in starts:
            new_hists.append(h)
    return past[:-1] + new_hists


def get_label(label):
    return Label(
        fa=label.get("fa", {}).get("value"), en=label.get("en", {}).get("value")
    )


def get_item(data) -> Item:
    wiki_item = get_wikidata_item(data["wikidata"])
    name = get_label(wiki_item["labels"])
    description = get_label(wiki_item["descriptions"])
    city_id = (
        wiki_item["claims"]
        .get("P551", [{}])[0]
        .get("mainsnak", {})
        .get("datavalue", {})
        .get("value", {})
        .get("id")
    )
    if city_id:
        labels = get_wikidata_item_label(city_id)
        city = WikidataItem(
            id=city_id,
            value=get_label(labels),
        )
    else:
        city = None
    gender_id = (
        wiki_item["claims"]
        .get("P21", [{}])[0]
        .get("mainsnak", {})
        .get("datavalue", {})
        .get("value", {})
        .get("id")
    )
    if gender_id:
        labels = get_wikidata_item_label(gender_id)
        gender = WikidataItem(
            id=gender_id,
            value=get_label(labels),
        )
    else:
        gender = None

    social_media = SocialMdedia()
    twitte_id = (
        wiki_item["claims"]
        .get("P2002", [{}])[0]
        .get("mainsnak", {})
        .get("datavalue", {})
        .get("value")
    )
    if twitte_id:
        social_media.twitter = twitte_id

    instagram_id = (
        wiki_item["claims"]
        .get("P2003", [{}])[0]
        .get("mainsnak", {})
        .get("datavalue", {})
        .get("value")
    )
    if instagram_id:
        social_media.instagram = instagram_id

    status = Status(value=status_dict.get(data["status"], StatusEnum.UNKNOWN))
    context = Label.parse_obj(data.get("context", {}))
    hashtags = []
    for htag in wiki_item["claims"].get("P2572", []):
        mainsnak = htag["mainsnak"]
        tweet_ids = []
        for ref in mainsnak.get("references", []):
            for r in ref.get("snaks", {}).get("P5933", []):
                if tid := r.get("datavalue", {}).get("value"):
                    tweet_ids.append(tid)
        hashtags.append(
            Hashtag(value=mainsnak["datavalue"]["value"], tweet_id=tweet_ids)
        )
    recent_tweets_hist = [TweetHist.parse_obj(t) for t in data["recent_tweets_hist"]]
    recent_tweets_count = data["recent_tweets_count"]
    recent_tweets_hist_verified = [
        TweetHist.parse_obj(t)
        for t in (data.get("recent_tweets_hist_verified", []) or [])
    ]
    recent_tweets_count_verified = data.get("recent_tweets_count_verified")
    return Item(
        wikidata=data["wikidata"],
        name=name,
        description=description,
        city=city,
        gender=gender,
        status=status,
        context=context,
        hashtags=hashtags,
        social_media=social_media,
        recent_tweets_hist=recent_tweets_hist,
        recent_tweets_count=recent_tweets_count,
        recent_tweets_hist_verified=recent_tweets_hist_verified,
        recent_tweets_count_verified=recent_tweets_count_verified,
    )


def update_wiki_item(item: Item):
    wiki_item = wbi.item.get(item.wikidata)
    wiki_item.labels.set(language="en", value=item.name.en)
    wiki_item.labels.set(language="fa", value=item.name.fa)
    wiki_item.descriptions.set(language="fa", value=item.description.fa)
    wiki_item.descriptions.set(language="en", value=item.description.en)
    statements = []
    hashtags = [String(prop_nr="P2572", value=htag.value) for htag in item.hashtags]
    statements.extend(hashtags)
    if item.city.id:
        residence = WikiItem(prop_nr="P551", value=item.city.id)
        if refs := item.city.refs:
            residence.references = [URL(value=ref, prop_nr="P854") for ref in refs]
        statements.append(residence)

    if item.gender.id and item.gender.id.startswith("Q"):
        gender = WikiItem(prop_nr="P21", value=item.gender.id)
        if refs := item.gender.refs:
            gender.references = [URL(value=ref, prop_nr="P854") for ref in refs]
        statements.append(gender)
    wiki_item.claims.add(statements, ActionIfExists.REPLACE_ALL)
    wiki_item.write()
    return wiki_item


def convert_to_elastic(item: Item):
    return {
        "update_dt": today,
        "wikidata": item.wikidata,
        "name": item.name.fa,
        "status": item.status.value.value,
        "recent_tweets_count": item.recent_tweets_count,
        "recent_tweets_hist": [json.loads(a.json()) for a in item.recent_tweets_hist],
        "recent_tweets_hist_verified": [
            json.loads(a.json()) for a in item.recent_tweets_hist_verified
        ],
        "recent_tweets_count_verified": item.recent_tweets_count_verified,
    }


def get_uri(name, city=""):
    return uuid.uuid3(uuid.NAMESPACE_DNS, name + city).__hash__()
