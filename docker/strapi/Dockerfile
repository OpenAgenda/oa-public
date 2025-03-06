FROM ubuntu:20.04

ARG DOCKER_USER_ID
ARG DOCKER_USER_GROUP_ID
ENV HOME /root

RUN apt-get update -y \
    && apt-get install -y apt-utils apt-transport-https ca-certificates curl gnupg ssh

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

WORKDIR /root

RUN chmod -R a+rwX /root

COPY packages/strapi/yarn.lock-workspace yarn.lock
COPY packages/strapi/package.json package.json

RUN groupadd -g ${DOCKER_USER_GROUP_ID} strapigroup
RUN useradd -m -u ${DOCKER_USER_ID} -g ${DOCKER_USER_GROUP_ID} strapiuser

USER ${DOCKER_USER_ID}:${DOCKER_USER_GROUP_ID}

RUN echo "nodeLinker: node-modules" >> /root/.yarnrc.yml

RUN yarn
