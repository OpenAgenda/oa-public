FROM php:5.5.30-fpm

ENV NVM_DIR /root/.nvm
ENV NODE_VERSION 12.16.3

WORKDIR /root

RUN mkdir $NVM_DIR

RUN apt-get update -y \
    && apt-get install -y curl ssh git gnupg2 python python3-distutils g++ make apt-utils

RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | NODE_VERSION="" bash \
    && . $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION --with-intl=full-icu --download=all \
    && nvm alias default $NODE_VERSION \
    && nvm use default

ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH      $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

RUN node -v

RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - \
    && echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list \
    && apt-get install apt-transport-https -y \
    && apt-get update -y \
    && apt-get install --no-install-recommends yarn -y

RUN mkdir -p /root/.ssh \
    && touch /root/.ssh/known_hosts \
    && ssh-keyscan bitbucket.org >> /root/.ssh/known_hosts

ENV NPM_TOKEN=""

# add the npm token
RUN echo "npmRegistries:\n  //registry.npmjs.org:\n    npmAuthToken: \"\${NPM_TOKEN}\"\n" >> /root/.yarnrc.yml
