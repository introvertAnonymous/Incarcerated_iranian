# Incarcerated Iranian UI

## Quickstart
I have used [this](https://github.com/rafsaf/minimal-fastapi-postgres-template) template, for more info you visit that repo.

1. Install dependencies
```bash
cd project_name
### Poetry install (python3.10)
poetry install

### Optionally there are also requirements
python3.10 -m venv venv
source venv/bin/activate
pip install -r requirements-dev.txt
```

2. Setup database
```bash
### first prepare .env file and edit it with custom values
copy .env.example .env

### Setup two databases
docker-compose up -d

### Alembic migrations upgrade and initial_data.py script
bash init.sh
```
3. Now you can run app
```bash
### And this is it:
uvicorn app.main:app --reload

```