# See https://unit.nginx.org/installation/#docker-images

FROM nginx/unit:1.28.0-python3.10

ENV PYTHONUNBUFFERED 1

RUN apt-get update && apt-get install -y python3-pip

# Build folder for our app, only stuff that matters copied.
RUN mkdir build
WORKDIR /build

COPY ./incarcerated_iranian/requirements.txt incarcerated_iranian_requirements.txt
COPY ./incarcerated_api incarcerated_api
# Update, install requirements and then cleanup.
COPY ./requirements.txt .
COPY ./setup.py .
COPY Readme.md .

RUN pip install -e . && pip install -r incarcerated_iranian_requirements.txt


RUN apt-get remove -y python3-pip  \
    && apt-get autoremove --purge -y  \
    && rm -rf /var/lib/apt/lists/* /etc/apt/sources.list.d/*.list

# Copy the rest of app
COPY ./incarcerated_iranian/app ./app
COPY ./incarcerated_iranian/alembic ./alembic
COPY ./incarcerated_iranian/alembic.ini .
COPY ./incarcerated_iranian/pyproject.toml .

# Nginx unit config and init.sh will be consumed at container startup.
COPY ./incarcerated_iranian/init.sh /docker-entrypoint.d/init.sh
COPY ./incarcerated_iranian/nginx-unit-config.json /docker-entrypoint.d/config.json
#COPY ./cert/bundle.pem /docker-entrypoint.d/bundle.pem
RUN chmod a+x /docker-entrypoint.d/init.sh