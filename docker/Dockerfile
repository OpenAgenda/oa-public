FROM ubuntu:18.04

RUN apt-get update -y \
    && apt-get install -y apt-utils apt-transport-https sudo curl ssh gcc g++ make

RUN curl -sL https://deb.nodesource.com/setup_14.x | bash - \
    && apt-get install -y nodejs \
    && node -v

RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - \
    && echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list \
    && apt-get update -y \
    && apt-get install -y --no-install-recommends yarn \
    && yarn -v

RUN mkdir -p /root/.ssh \
    && touch /root/.ssh/known_hosts \
    && ssh-keyscan bitbucket.org >> /root/.ssh/known_hosts

ENV NPM_TOKEN=""

# add the npm token
RUN echo "npmRegistries:\n  //registry.npmjs.org:\n    npmAuthToken: \"\${NPM_TOKEN}\"\n" >> /root/.yarnrc.yml

# Add user and make it sudoer
ARG uid=1000
ARG gid=1000
ARG user=username
RUN addgroup --system --gid $gid $user \
    && adduser --system --disabled-password --no-create-home --group --gecos '' --shell /bin/bash --home $HOME --uid $uid $user \
    && adduser $user sudo \
    && echo $user' ALL=(ALL) NOPASSWD:ALL' | sudo tee /etc/sudoers.d/$user

WORKDIR /root

RUN chown -Rh $user .

USER $user
