import json
import re
from datetime import datetime
from typing import Dict
import uuid
from incarcerated_api.pydantic_types import (
    Item,
    Label,
)


special_utf_reg = re.compile("[\u200a-\uFFFF]+")
get_today = lambda: datetime.now().strftime("%Y-%m-%dT00:00:00Z")
# today = datetime.now().strftime("%Y-%m-%dT00:00:00Z")


def remove_special_chars(t: str) -> str:
    """helper function for removing special persian chars

    Args:
        t (str): _description_

    Returns:
        str: _description_
    """
    return special_utf_reg.sub("", t)


def get_uri(name, city=""):
    """helper function for getting unified id based on name and city of each person.
    NOTE: this method have this issue if two person have same in one city can't be added. We have to distinguish them!

    Args:
        name (_type_): _description_
        city (str, optional): _description_. Defaults to "".

    Returns:
        _type_: _description_
    """
    return uuid.uuid3(uuid.NAMESPACE_DNS, name + city).__hash__()


def get_label(label: Dict[str, Dict[str, str]]) -> Label:
    """helper function for fa/en label

    Args:
        label (_type_): _description_

    Returns:
        _type_: _description_
    """
    return Label(
        fa=label.get("fa", {}).get("value"), en=label.get("en", {}).get("value")
    )


# depricated
def convert_to_elastic(item: Item):
    return {
        "update_dt": get_today(),
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
