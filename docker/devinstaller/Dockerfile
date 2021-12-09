FROM php:5.5.30-fpm

RUN apt-get update -y \
    && apt-get install -y apt-utils apt-transport-https curl ssh git gcc g++ make

RUN curl -sL https://deb.nodesource.com/setup_16.x | bash - \
    && apt-get install -y --force-yes nodejs \
    && node -v

RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - \
    && echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list \
    && apt-get update -y \
    && apt-get install -y --no-install-recommends yarn \
    && yarn -v

RUN mkdir -p /root/.ssh \
    && touch /root/.ssh/known_hosts \
    && ssh-keyscan github.com >> /root/.ssh/known_hosts

ENV NPM_TOKEN=""

# add the npm token
RUN echo "npmRegistries:\n  //registry.npmjs.org:\n    npmAuthToken: \"\${NPM_TOKEN}\"\n" >> /root/.yarnrc.yml

RUN chmod -R a+rwX /root
