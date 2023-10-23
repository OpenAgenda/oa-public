FROM ubuntu:20.04

ENV HOME /root

RUN apt-get update -y \
    && apt-get install -y apt-utils apt-transport-https ca-certificates curl gnupg ssh

RUN apt-get install -y imagemagick libmagick++-dev libmagic-dev webp

ENV NODE_MAJOR=20

RUN mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
    | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" \
    | tee /etc/apt/sources.list.d/nodesource.list
RUN apt-get update -y \
    && apt-get install -y nodejs \
    && node -v

RUN npm install -g pm2
