'use strict';

const log = require('@openagenda/logs')('services/discord');
const Discord = require('@openagenda/discord');

module.exports.init = config => Discord({
  token: config.discord.token,
  channel: config.discord.channel
});
