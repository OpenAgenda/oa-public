'use strict';

const { App } = require('@slack/bolt');
const userRegistration = require('./userRegistration');
const agendaCreation = require('./agendaCreation');

function init(config, services) {
  if (!config.slackApp?.signingSecret || !config.slackApp?.token) {
    return;
  }

  const slackApp = new App({
    signingSecret: config.slackApp.signingSecret,
    token: config.slackApp.token,
    endpoints: '/'
  });

  const slackConfig = {
    token: config.slackApp.token,
    channel: config.slackApp.channel,
    root: config.root
  }

  // Shortcuts for sending messages
  slackApp.postMessage = {
    userRegistration: userRegistration.postMessage(slackApp, services, slackConfig),
    agendaCreation: agendaCreation.postMessage(slackApp, services, slackConfig)
  };

  // Listen actions and events
  userRegistration.registerEvents(slackApp, services, slackConfig);
  agendaCreation.registerEvents(slackApp, services, slackConfig);

  return slackApp;
}

function plugApp(app) {
  const { slackApp } = app.services;

  if (!slackApp) {
    return;
  }

  app.use('/slack/events', slackApp.receiver.router);
}

module.exports = {
  init,
  plugApp
};
