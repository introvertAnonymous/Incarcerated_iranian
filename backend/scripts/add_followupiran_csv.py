from incarcerated_api.utils.elastic import get_es_client
import pandas as pd
from incarcerated_api.utils import get_uri, remove_special_chars
from incarcerated_api.constants import ELASTIC_INDEX, DATA_PATH
from incarcerated_api.pydantic_types import Item, Label, Status, StatusEnum
from incarcerated_api.utils import get_today
import jdatetime
from datetime import datetime
import convert_numbers
import os
from tqdm import tqdm
import json
from incarcerated_api.utils.elastic import insert_array_to_elastic

status_dict = {value.value: value for value in StatusEnum.__members__.values()}
month_dict = {month: i for i, month in enumerate(jdatetime.date.j_months_fa)}

people_list_df = pd.read_csv(os.path.join(DATA_PATH, "followupiran.csv"))

es = get_es_client()


coloumns = people_list_df.columns


def get_item_from_csv(row: pd.Series) -> Item:
    row = row.fillna("")
    name = remove_special_chars(row[coloumns[0]]).strip()
    if not name:
        return
    city = remove_special_chars(row[coloumns[1]] or "").strip()
    uri = get_uri(name, city)
    conviction = row[coloumns[5]] or None
    decision = row[coloumns[6]] or None
    if conviction:
        conviction = remove_special_chars(conviction).strip()
    if decision:
        decision = remove_special_chars(decision).strip()
    try:
        status = Status(value=status_dict[row[coloumns[2]]])
    except:
        status = None
    try:
        doc = es.get(index=ELASTIC_INDEX, id=uri)
        if (
            doc["_source"]["status"]["value"] != status.value.value
            or decision != doc["_source"].get("decision")
            or conviction != doc["_source"].get("conviction")
        ):
            doc["_source"]["status"]["value"] = status.value.value
            doc["_source"]["decision"] = decision
            doc["_source"]["conviction"] = conviction
            es.update(index=ELASTIC_INDEX, id=doc["_id"], doc=doc["_source"])
    except:
        activity = row[coloumns[3]]
        info = row[coloumns[4]]
        detention_date = None
        detention = row[coloumns[7]]
        if detention and len(detention.split()) >= 2:
            number = detention.split()[0]
            if (day := convert_numbers.persian_to_english(number)) or (
                day := convert_numbers.arabic_to_english(number)
            ):
                month = month_dict.get(detention.split()[1])
                if month:
                    detention_date = datetime.fromisoformat(
                        jdatetime.date(1401, month, int(day), locale="fa_IR")
                        .togregorian()
                        .isoformat()
                    )

        description = remove_special_chars(
            activity
            or "" + " " + info
            or "" + " " + conviction
            or "" + " " + decision
            or ""
        )
        description = " ".join(description.split()).strip()
        status = Status(value=status_dict[row[coloumns[2]]])
        item = Item(
            uri=uri,
            name=Label(fa=name),
            city=city,
            updated_at=get_today(),
            status=status,
            description=Label(fa=description),
            conviction=conviction,
            decision=decision,
            detention_datetime=detention_date,
            hashtags=["_".join(name.split())],
        )
        return item


new_items = []
for i, row in tqdm(people_list_df.iterrows()):
    item = get_item_from_csv(row)
    if item:
        new_items.append(json.loads(item.json()))
    if len(new_items) > 100:
        insert_array_to_elastic(es, new_items)
        new_items = []
insert_array_to_elastic(es, new_items)
