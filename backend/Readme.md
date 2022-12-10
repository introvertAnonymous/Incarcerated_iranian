## Project Backend structure
This is a python project which is using FastAPI and [this](https://github.com/rafsaf/minimal-fastapi-postgres-template) boilerplate for implementing APIs.
We have impeleneted a simple package, `incarcerated_api`, to organize and prepare data required for the application. The `incarcerated_iranian` is the FastAPI app to serve the APIs.  

The idea is to upload all data to Wikidata and so that it can be maintained in a proper way. Right now, we are using an Elasticsearch instance, which will be changed in the future, for the informatio that I don't know how to ingest into Wikidata.

## Getting started
To get started, simply run the following to install incarcerated_api package
```bash
pip install -e .
```
And go to incarcerated_iranian directory and for the development, install it using the following command.
```bash
cd incarcerated_iranian
pip install -r requirements-dev.txt
```
Now you have to change the .env.example content and create the .env file and run the postgress service using docker.
```bash
copy .env.example .env
docker compose up -d
```
FInally you can start the app
```bash
uvicorn app.main:app --reload
```

## TODOs
- [ ] Add on-line Twitter search
- [ ] Add Twitter scraper as a service to update data