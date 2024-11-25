import DiscordClient from 'discord.js';
import notifyUserCreation from './lib/notifyUserCreation.js';
import notifyAgendaCreation from './lib/notifyAgendaCreation.js';

const initializeClient = (config) =>
  new Promise((rs) => {
    const client = new DiscordClient.Client();
    client.login(config.token);
    client.once('ready', () => {
      rs(client);
    });
  });

const noopSvc = async () => ({
  notifyUserCreation: async () => null,
  notifyAgendaCreation: async () => null,
});

export default async (config = {}) => {
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
