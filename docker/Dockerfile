FROM ubuntu:24.04

ENV HOME=/root

RUN apt-get update -y \
    && apt-get install -y apt-utils apt-transport-https ca-certificates curl gnupg ssh

RUN apt-get install -y imagemagick libmagick++-dev libmagic-dev webp

ENV NODE_MAJOR=22

RUN mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
    | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" \
    | tee /etc/apt/sources.list.d/nodesource.list
RUN apt-get update -y \
    && apt-get install -y nodejs \
    && node -v

RUN corepack enable \
    && yarn -v

RUN mkdir -p /root/.ssh \
    && touch /root/.ssh/known_hosts \
    && ssh-keyscan -4 github.com >> /root/.ssh/known_hosts

ENV NPM_TOKEN=""

# add the npm token
RUN echo "npmRegistries:\n  //registry.npmjs.org:\n    npmAuthToken: \"\${NPM_TOKEN}\"\n" >> /root/.yarnrc.yml

WORKDIR /root

# give access to all users
RUN chmod -R a+rwX .
