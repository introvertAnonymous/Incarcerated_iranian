import json
import os
from incarcerated_api.utils.elastic import get_es_client
from incarcerated_api.constants import CONFIG_PATH, ELASTIC_INDEX

people_mapping = json.load(open(os.path.join(CONFIG_PATH, "people.json")))

es = get_es_client()
es.indices.delete(index=ELASTIC_INDEX, ignore_unavailable=True)
es.indices.create(index=ELASTIC_INDEX, mappings=people_mapping)
