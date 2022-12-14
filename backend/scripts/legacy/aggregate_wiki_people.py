from incarcerated_api.constants import DATA_PATH
from incarcerated_api.utils import remove_special_chars
from incarcerated_api.utils.wikidata import wbi
from incarcerated_api.utils.twitter import get_count_hist
from wikibaseintegrator.datatypes import Item, Quantity
from wikibaseintegrator.wbi_enums import ActionIfExists
from glob import glob
import os
from tqdm import tqdm
import json
from tqdm import tqdm
import uuid

keys = ["name", "city", "status", "main_occupation", "tags"]


def prepare_item(row):

    item = {
        key: remove_special_chars(value.strip())
        for key, value in zip(keys[:-1], row[:4])
    }
    uri = item["uri"] = uuid.uuid3(
        uuid.NAMESPACE_DNS,
        item["name"] + item.get("city", "") + item.get("main_occupation", ""),
    ).__hash__()
    try:
        item = json.load(open(f"../../data/people/{uri}.json"))
        return item
    except:
        pass
    if row.shape[0] > 4:
        item[keys[-1]] = [k for k in row[4:]]
    item["recent_tweets_hist"] = get_count_hist(item["name"])
    item["recent_tweets_count"] = sum(
        [d["tweet_count"] for d in item["recent_tweets_hist"]]
    )
    if item["recent_tweets_count"]:
        item["recent_tweets_hist_verified"] = get_count_hist(item["name"], 1)
        item["recent_tweets_count_verified"] = sum(
            [d["tweet_count"] for d in item["recent_tweets_hist_verified"]]
        )
    return item


# for ind, row in tqdm(info_names_df.iterrows()):
#     row = row.dropna()
#     if row.shape[0] == 0:
#         continue
#     while True:
#         try:
#             try:
#                 item = prepare_item(row)
#             except BadRequest:
#                 print("row bad request ", row)
#                 break
#             break
#         except TooManyRequests as e:
#             print("sleeping")
#             time.sleep(120)

#     uri = item["uri"]
#     json.dump(item, open(f"../../data/people/{uri}.json", "w"), ensure_ascii=False)


filenames = glob(os.path.join(DATA_PATH, "people_mod") + "/*.json")

pbar = tqdm(filenames)
data = []
for filename in pbar:
    item = json.load(open(filename))
    if not (wiki_id := item.get("wiki_id")):
        continue
    if item["status"] == "آزاد شد":
        continue
    qualifiers = [Quantity(amount=item["recent_tweets_count"], prop_nr="P1114")]
    data.append(Item(prop_nr="P3342", value=wiki_id, qualifiers=qualifiers))
item = wbi.item.get("Q115571674")
item.claims.add(data, ActionIfExists.REPLACE_ALL)
item.write()
# for filename in pbar:
#     item = json.load(open(filename))
#     if not (wiki_id := item.get("wiki_id")):
#         continue
#     wiki_item = wbi.item.get(wiki_id)
#     hashtag = wiki_item.claims.get("P2572")[0]
#     hashtag_value = hashtag.mainsnak.datavalue["value"][1:]
#     hist = get_count_hist(hashtag_value)
#     item["recent_tweets_hist"] = item["recent_tweets_hist"][:-1]
#     keys = [f"{d['start']}-{d['end']}" for d in item["recent_tweets_hist"]]
#     for d in hist:
#         if f"{d['start']}-{d['end']}" not in keys:
#             item["recent_tweets_hist"].append(d)
#     hashtag.qualifiers[0]
#     break
