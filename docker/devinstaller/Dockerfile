FROM node:lts

RUN mkdir -p /root/.ssh \
    && touch /root/.ssh/known_hosts \
    && ssh-keyscan github.com >> /root/.ssh/known_hosts

ENV NPM_TOKEN=""

# add the npm token
RUN echo "npmRegistries:\n  //registry.npmjs.org:\n    npmAuthToken: \"\${NPM_TOKEN:null}\"\n" >> /root/.yarnrc.yml

RUN chmod -R a+rwX /root
