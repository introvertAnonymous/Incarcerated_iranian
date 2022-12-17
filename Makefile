SHELL = /bin/bash

PROJECT_NAME = incarcerated
PYTHON_INTERPRETER = python


include backend/.env
export $(shell sed 's/=.*//' backend/.env)

data/followupiran.csv:
	wget "https://docs.google.com/spreadsheets/d/1uhfm9FWCcB7qw_i7LpJiP219CxXf_nPC8UiM_X-IQgk/export?format=csv&gid=1028452535" -O "data/followupiran.csv"

.PHONY: followupiran_parse
followupiran_parse: data/followupiran.csv
	$(PYTHON_INTERPRETER) backend/scripts/add_followupiran_csv.py
	

.PHONY: update_twitter
update_twitter:
	$(PYTHON_INTERPRETER) backend/scripts/update_tweet_counts.py