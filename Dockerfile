FROM ubuntu:latest

RUN apt-get update && \
    apt-get -y install curl swapspace git

COPY .meteor .
RUN curl https://install.meteor.com/?release=1.4.1.1 | sh
