from elasticsearch.helpers import streaming_bulk
from elasticsearch import Elasticsearch


def get_elastic_client(elastic_url=None, password=None) -> Elasticsearch:
    client = Elasticsearch(
        elastic_url,
        basic_auth=("elastic", password) if password else None,
        request_timeout=300,
        max_retries=10,
        retry_on_timeout=True
        # verify_certs=False
    )
    return client


es_client = get_elastic_client(
    elastic_url="https://mahsa.es.us-central1.gcp.cloud.es.io:9243",
    password="AxvBqDS5pZStxdKVAqbGe4Gg",
)


def bulk_insert(data, index_name="tweets"):
    def load_job():
        for d in data:
            yield d

    for _, _ in streaming_bulk(
        client=es_client,
        index=index_name,
        actions=load_job(),
        raise_on_exception=False,
        raise_on_error=False,
        max_retries=100,
        request_timeout=300,
    ):
        pass

