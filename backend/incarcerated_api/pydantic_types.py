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


class Item(BaseModel):
    wikidata: str
    name: Label
    description: Optional[Label]
    context: Optional[Label]
    date_of_birth: Optional[DateLabel]
    date_of_death: Optional[DateLabel]
    city: Optional[WikidataItem]
    gender: Optional[WikidataItem]
    status: Optional[Status]
    social_media: Optional[SocialMdedia]
    news: Optional[List[str]]
    hashtags: Optional[List[Hashtag]]
    wikipedia: Optional[str]
    twitter_moment: Optional[List[str]]
    recent_tweets_hist: Optional[List[TweetHist]]
    recent_tweets_count: Optional[int]
    recent_tweets_hist_verified: Optional[List[TweetHist]]
    recent_tweets_count_verified: Optional[int]
