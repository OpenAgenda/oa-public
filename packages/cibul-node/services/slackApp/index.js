'use strict';

const { App } = require('@slack/bolt');
const userRegistration = require('./userRegistration');

function init(config, services) {
  const slackApp = new App({
    signingSecret: config.slackApp.signingSecret,
    token: config.slackApp.token,
    endpoints: '/'
  });

  // Shortcuts for sending messages
  slackApp.postMessage = {
    userRegistration: userRegistration.postMessage(slackApp, services)
  };

  // Listen actions and events
  userRegistration.registerEvents(slackApp, services);

  return slackApp;
}

function plugApp(app) {
  const { slackApp } = app.services;

  app.use('/slack/events', slackApp.receiver.router);
}

module.exports = {
  init,
  plugApp
};
