import os
from incarcerated_api.enums import StatusEnum

here = os.path.dirname(__file__)
DATA_PATH = os.getenv("DATA_PATH", os.path.join(here, "../../data"))
CONFIG_PATH = os.getenv("CONFIG_PATH", os.path.join(here, "../configs"))
WIKI_CLIENT_APPLICATION_KEY = os.getenv("WIKI_CLIENT_APPLICATION_KEY")
WIKI_CLIENT_APPLICATION_SECRET = os.getenv("WIKI_CLIENT_APPLICATION_SECRET")
CONSUMER_KEY = os.getenv("CONSUMER_KEY")
CONSUMER_SECRET = os.getenv("CONSUMER_SECRET")
ACCESS_TOKEN = os.getenv("ACCESS_TOKEN")
ACCESS_TOKEN_SECRET = os.getenv("ACCESS_TOKEN_SECRET")
BEARER_TOKEN = os.getenv("BEARER_TOKEN")
status_dict = {
    "آزاد شد": StatusEnum.FREE,
    "زندانی": StatusEnum.IN_JAIL,
    "در بازداشت کشته شد": StatusEnum.DEAD,
}

ELASTIC_URL = os.getenv("ELASTIC_URL")
ELASTIC_PASSWORD = os.getenv("ELASTIC_PASSWORD")
ELASTIC_INDEX = "people"
