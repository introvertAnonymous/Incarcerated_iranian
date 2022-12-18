from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

from incarcerated_api.enums import StatusEnum


class Label(BaseModel):
    fa: Optional[str]
    en: Optional[str]


class DateLabel(BaseModel):
    value: datetime
    refs: Optional[List[str]]


class WikidataItem(BaseModel):
    id: str  # TODO add verfication to make sure id exists in wikidata
    value: Label
    refs: Optional[List[str]]


class Status(BaseModel):
    value: StatusEnum = StatusEnum.UNKNOWN
    refs: Optional[List[str]]
    date: Optional[datetime]


class SocialMdedia(BaseModel):
    twitter: Optional[str]
    instagram: Optional[str]


class Hashtag(BaseModel):
    # TODO verification
    value: str
    tweet_id: Optional[List[str]]


class TweetHist(BaseModel):
    start: datetime
    end: datetime
    tweet_count: int


class ItemCreate(BaseModel):
    name: Label
    detention_datetime: Optional[datetime]
    age: Optional[int]
    external_links: Optional[List[str]]
    wikidata: Optional[str]
    description: Optional[Label]
    date_of_birth: Optional[DateLabel]
    date_of_death: Optional[DateLabel]
    city: Optional[str]
    gender: Optional[WikidataItem]
    status: Optional[Status]
    social_media: Optional[SocialMdedia]
    news: Optional[List[str]]
    tweets: Optional[List[str]]
    hashtags: Optional[List[str]]
    conviction: Optional[str]
    decision: Optional[str]
    tags: Optional[List[str]]


class Item(ItemCreate):
    uri: str
    updated_at: datetime
    recent_tweets_hist: Optional[List[TweetHist]]
    recent_tweets_count: Optional[int]
    recent_tweets_hist_verified: Optional[List[TweetHist]]
    recent_tweets_count_verified: Optional[int]


class StatTerm(BaseModel):
    key: str
    doc_count: int


class CityDist(BaseModel):
    prison: List[StatTerm]
    free: List[StatTerm]
