SHELL = /bin/bash

PROJECT_NAME = incarcerated
PYTHON_INTERPRETER = python

.PHONY: followupiran_csv

include backend/.env
export $(shell sed 's/=.*//' backend/.env)

followupiran_csv:
	$(PYTHON_INTERPRETER) backend/scripts/add_followupiran_csv.py
	