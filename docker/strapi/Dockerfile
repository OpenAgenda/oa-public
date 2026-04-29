FROM ubuntu:24.04

ARG DOCKER_USER_ID
ARG DOCKER_USER_GROUP_ID
ENV HOME=/root

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

# SQLite writes WAL/journal/shm files alongside the DB. The compose
# bind-mounts the DB at /home/strapiuser/db.sqlite — pre-create the parent
# dir owned by the build-time UID so the unprivileged container user can
# create those side files (otherwise the dir is root:root 755 and SQLite
# reports the misleading "readonly database" error).
RUN mkdir -p /home/strapiuser \
    && chown ${DOCKER_USER_ID}:${DOCKER_USER_GROUP_ID} /home/strapiuser

COPY packages/strapi/yarn.lock-workspace yarn.lock
COPY packages/strapi/package.json package.json

USER ${DOCKER_USER_ID}:${DOCKER_USER_GROUP_ID}

RUN echo "nodeLinker: node-modules" >> /root/.yarnrc.yml

RUN yarn
