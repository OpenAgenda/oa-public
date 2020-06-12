FROM php:5.5.30-fpm

RUN apt-get update -y
RUN apt-get install curl ssh git -y

WORKDIR /root
RUN mkdir /root/.nvm
ENV NVM_DIR /root/.nvm
ENV NODE_VERSION 12.16.3

RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash \
    && . $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION --with-intl=full-icu --download=all \
    && nvm alias default $NODE_VERSION \
    && nvm use default

ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH      $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

RUN node -v

RUN mkdir /root/.ssh
RUN touch /root/.ssh/known_hosts
RUN ssh-keyscan bitbucket.org >> /root/.ssh/known_hosts

RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt-get install apt-transport-https -y
RUN apt-get update -y
RUN apt-get install yarn -y

# add the npm token
RUN echo "npmRegistries:\n  //registry.npmjs.org:\n    npmAuthToken: \"\${NPM_TOKEN}\"\n" >> /root/.yarnrc.yml
