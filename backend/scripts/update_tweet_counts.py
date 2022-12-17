from incarcerated_api.constants import ELASTIC_INDEX
from incarcerated_api.utils.twitter import (
    get_count_hist,
    get_query_hashtag,
    merge_tweet_hists,
)
from incarcerated_api.utils import get_today
from incarcerated_api.utils.elastic import (
    get_es_client,
    insert_array_to_elastic,
)
from incarcerated_api.enums import StatusEnum
from tqdm import tqdm


BATCH_SIZE = 100
es = get_es_client()

people_data = es.search(index=ELASTIC_INDEX, size=10000).body
pbar = tqdm(people_data["hits"]["hits"])
results = []
for data in pbar:
    data = data["_source"]
    pbar.set_description(str(data["uri"]))
    hashtag = get_query_hashtag(data)
    if len(hashtag) < 3:
        continue
    if (data.get("status") or {}).get("value") == StatusEnum.FREE:
        continue
    # print("hashtag", hashtag)
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
    results.append(data)
    if len(results) > BATCH_SIZE:
        insert_array_to_elastic(es, results, ELASTIC_INDEX)
        results = []
insert_array_to_elastic(es, results, ELASTIC_INDEX)
