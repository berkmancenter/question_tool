#!/bin/bash

export MONGO_URL='mongodb://admin:example@mongo:27017/app_db'
export MAIL_URL='smtp://0b810ccaee1cff:6f051f63c0927a@smtp.mailtrap.io:25/'

echo "Starting Meteor"
cd /app
meteor npm install
meteor
