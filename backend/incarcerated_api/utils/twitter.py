from typing import Any, Dict, List
import tweepy
from incarcerated_api.constants import (
    CONSUMER_KEY,
    CONSUMER_SECRET,
    ACCESS_TOKEN,
    ACCESS_TOKEN_SECRET,
    BEARER_TOKEN,
)
from . import remove_special_chars
import logging


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


def get_query_hashtag(data: Dict[str, Any]) -> str:
    """Generates twitter query based on the name or input hashtag from the input

    Args:
        data (Dict[str,Any]): _description_

    Returns:
        str: _description_
    """
    return (
        "(" + " OR ".join(data["hashtags"]) + ")"
        if len(data["hashtags"])
        else remove_special_chars(data["name"]["fa"])
    )


def get_count_hist(hashtag: str, is_verified=False) -> List[Dict[str, str | int]]:
    """Gets tweets count histogram based on the hashtag.

    Args:
        hashtag (str): _description_
        is_verified (bool, optional): _description_. Defaults to False.

    Returns:
        List[Dict[str, str | int]]: _description_
    """
    query = f"{hashtag}"
    if is_verified:
        query += " is:verified"
    result = tweepy_client.get_recent_tweets_count(query, granularity="day")
    return result.data


def merge_tweet_hists(
    past: List[Dict[str, Dict[str, str | int]]],
    current: List[Dict[str, Dict[str, str | int]]],
) -> List[Dict[str, Dict[str, str | int]]]:
    """helper function for merging new and old tweet histograms

    Args:
        past (_type_): _description_
        current (_type_): _description_

    Returns:
        _type_: _description_
    """
    starts = [d["start"].split("T")[0] for d in past[:-1]]
    new_hists = []
    for h in current:
        if h["start"].split("T")[0] not in starts:
            new_hists.append(h)
    return past[:-1] + new_hists
