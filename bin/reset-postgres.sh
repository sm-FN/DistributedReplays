#!/bin/bash

DATABASE="saltie"

psql -U postgres -h localhost -d postgres -c "DROP DATABASE \"$DATABASE\";"