import os
import json
from tqdm import tqdm
from glob import glob
from incarcerated_api.constants import DATA_PATH
from wikibaseintegrator.datatypes import Item, String, Quantity, Time, URL
from wikibaseintegrator.wbi_enums import ActionIfExists
from wikibaseintegrator.wbi_helpers import search_entities
from polyglot.text import Text
from incarcerated_api.utils import spceial_utf_reg, today, wbi
import time

# import logging

# logging.basicConfig(level=logging.DEBUG)

city_info = json.load(open(os.path.join(DATA_PATH, "city_info.json")))
city_info_dict = {c["value"]["fa"]: c for c in city_info}


def create_wiki_item(item):
    ents = search_entities(item["name"])
    found = False
    for ent in ents:
        wiki_item = wbi.item.get(ent)
        try:
            inst_ids = [
                inst.mainsnak.datavalue.get("value", {}).get("id")
                for inst in wiki_item.claims.get("P31")
            ]
            country_citizen = [
                inst.mainsnak.datavalue.get("value", {}).get("id")
                for inst in wiki_item.claims.get("P27")
            ]
            if "Q5" in inst_ids and "Q794" in country_citizen:
                found = True
                break
        except KeyError:
            pass
    data = []
    if not found:
        instance_of = Item(prop_nr="P31", value="Q5")
        country = Item(value="Q794", prop_nr="P27")
        # gender = Item(prop_nr="P21", value="Q6581097") # female:Q6581072 ; male:Q6581097
        data.extend([instance_of, country])
        res_value = city_info_dict.get(item["city"], {}).get("id")
        if res_value:
            residence = Item(prop_nr="P551", value=res_value)
            data.append(residence)
    hashtags = String(
        prop_nr="P2572",
        value="#" + "_".join(spceial_utf_reg.sub("", item["name"]).split()),
        # qualifiers=[Quantity(prop_nr="P1114", amount=item["recent_tweets_count"])],
    )
    convicted_of = Item(prop_nr="P1399", value="Q175331")
    if item["status"] == "آزاد شد":
        convicted_of.qualifiers = [Time(today, prop_nr="P582")]
    data.extend([convicted_of, hashtags])
    # Create a new item
    if not found:
        wiki_item = wbi.item.new()
        text = Text(item["name"], hint_language_code="fa")
        en_label = " ".join([t.capitalize() for t in text.transliterate("en")])
        # Set an english label
        wiki_item.labels.set(language="fa", value=spceial_utf_reg.sub("", item["name"]))
        # wiki_item.labels.set(language="en", value=en_label)
        # Set a Persian description
        description = spceial_utf_reg.sub(
            "", item.get("main_occupation", "") + " " + " | ".join(item.get("tags", []))
        )
        description = " ".join(description.split())
        wiki_item.descriptions.set(language="fa", value=description)

    wiki_item.claims.add(data)
    witem = wiki_item.write()
    return witem


def update_wiki_item(item):
    wiki_id = item["wiki_id"]
    try:
        wiki_item = wbi.item.get(wiki_id)
    except:
        return None
    references = [
        URL(
            prop_nr="P854",
            value="https://docs.google.com/spreadsheets/d/1uhfm9FWCcB7qw_i7LpJiP219CxXf_nPC8UiM_X-IQgk/edit#gid=1028452535",
        )
    ]
    hashtags = String(
        prop_nr="P2572",
        value="_".join(spceial_utf_reg.sub("", item["name"]).split()),
        # qualifiers=[Quantity(prop_nr="P1114", amount=item["recent_tweets_count"])],
    )
    event = Item(prop_nr="P793", value="Q114065797", references=references)
    wiki_item.add_claims(event)
    wiki_item.add_claims(hashtags, action_if_exists=ActionIfExists.REPLACE_ALL)
    try:
        wiki_item.claims.remove("P1399")
    except:
        pass
    wiki_item.write()
    return wiki_item


# I need to check first 323 for reference url

filenames = glob(os.path.join(DATA_PATH, "people_mod") + "/*.json")
pbar = tqdm(filenames)
for filename in pbar:
    # filename = "../../data/people/864361122551154200.json"
    item = json.load(open(filename))
    if item.get("wiki_id"):
        wiki_item = update_wiki_item(item)
        pbar.set_description(desc=f"wid: {item['wiki_id']}")
        if not wiki_item:
            item["wiki_id"] = None
            json.dump(item, open(filename, "w"), indent=3, ensure_ascii=False)
        # item["wiki_id"] = wiki_item.id
        time.sleep(10)
