from wikibaseintegrator import wbi_login, WikibaseIntegrator
from wikibaseintegrator.datatypes import Item as WikiItem, String, URL
from wikibaseintegrator.wbi_config import config as wbi_config
from wikibaseintegrator.wbi_enums import ActionIfExists
from incarcerated_api.constants import status_dict

from incarcerated_api.enums import StatusEnum
from incarcerated_api.pydantic_types import (
    Item,
    Label,
    SocialMdedia,
    WikidataItem,
    Status,
    Hashtag,
    TweetHist,
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
from . import get_label
import logging

from incarcerated_api.constants import (
    WIKI_CLIENT_APPLICATION_KEY,
    WIKI_CLIENT_APPLICATION_SECRET,
)


wbi_config[
    "USER_AGENT"
] = "MyWikibaseBot/1.0 (https://www.wikidata.org/wiki/User:IntrovertAnonymous)"

try:
    login_instance = wbi_login.OAuth2(
        consumer_token=WIKI_CLIENT_APPLICATION_KEY,
        consumer_secret=WIKI_CLIENT_APPLICATION_SECRET,
    )

    wbi = WikibaseIntegrator(login=login_instance)
except:
    wbi = WikibaseIntegrator()
    logging.warning(
        "Could not loging into wikidata instace. You can't edit wikidata objects. You just can retrieve data!"
    )


def get_wikidata_item(wiki_id):
    wikidata_item = wbi.item.get(entity_id=wiki_id)
    return wikidata_item.get_json()


def get_wikidata_item_label(wiki_id, lang=None):
    wikidata_item = wbi.item.get(entity_id=wiki_id)
    if lang:
        return wikidata_item.labels.get(lang).get_json()
    else:
        return wikidata_item.labels.get_json()


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
