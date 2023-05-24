FROM ubuntu:20.04

ENV HOME /root

RUN apt-get update -y \
    && apt-get install -y apt-utils apt-transport-https curl ssh gcc g++ make

RUN apt-get install -y imagemagick libmagick++-dev libmagic-dev webp

RUN curl -sL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && node -v

RUN npm install -g pm2