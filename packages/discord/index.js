'use strict';

const DiscordClient = require('discord.js');
const notifyUserCreation = require('./lib/notifyUserCreation');
const notifyAgendaCreation = require('./lib/notifyAgendaCreation');

const initializeClient = config => new Promise(rs => {
  const client = new DiscordClient.Client();
  client.login(config.token);
  client.once('ready', () => {
    rs(client);
  });
});

const noopSvc = async () => ({
  notifyUserCreation: async () => null,
  notifyAgendaCreation: async () => null
});

module.exports = async (config = {}) => {
  if (!config?.token) {
    return noopSvc();
  }
  const client = await initializeClient(config);
  const channel = client.channels.cache.get(config.channel);
  return {
    notifyUserCreation: notifyUserCreation(channel),
    notifyAgendaCreation: notifyAgendaCreation(channel),
  };
};
