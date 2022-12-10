from elasticsearch import Elasticsearch
from elasticsearch.helpers import streaming_bulk
from incarcerated_api.constants import ELASTIC_PASSWORD, ELASTIC_URL
from tqdm import tqdm


def get_es_client(elastic_url=None, password=None) -> Elasticsearch:
    _elastic_url = elastic_url or ELASTIC_URL
    _password = password or ELASTIC_PASSWORD
    client = Elasticsearch(
        _elastic_url,
        basic_auth=("elastic", _password) if _password else None,
        request_timeout=300,
        max_retries=10,
        retry_on_timeout=True,
    )
    return client


def bulk_insert(
    client,
    index_name,
    load_job,
    no_of_docs=None,
    max_retries=100,
    request_timeout=300,
    chunk_size=500,
) -> None:
    pbar = None
    if no_of_docs == None or no_of_docs > 0:
        pbar = tqdm(unit="docs", total=no_of_docs)
    for _, _ in streaming_bulk(
        client=client,
        index=index_name,
        actions=load_job(),
        raise_on_exception=False,
        raise_on_error=False,
        max_retries=max_retries,
        request_timeout=request_timeout,
        chunk_size=chunk_size,
    ):
        if pbar:
            pbar.update(1)
