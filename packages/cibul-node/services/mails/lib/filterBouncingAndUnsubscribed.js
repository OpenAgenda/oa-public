'use strict';

const _ = require('lodash');
const axios = require('axios');

const isUnsubscribed = require('./isUnsubscribed');

module.exports = async (services, config, params) => {
  const { logs } = services;
  const log = logs('services/mails/filterBouncingAndUnsubscribed');

  const { unsubscriptions } = params.to;
  const abilityArgs = unsubscriptions && unsubscriptions.length
    ? _.find(unsubscriptions, 'memberId') || unsubscriptions[unsubscriptions.length - 1]
    : null;
  const email = params.to.address;

  try {
    const { data: bounce } = await axios(`https://api.mailgun.net/v3/${config.mailgun.domain}/bounces/${email}`, {
      auth: {
        username: 'api',
        password: config.mailgun.apiKey,
      },
    });

    if (bounce && bounce.code) {
      return false;
    }
  } catch (error) {
    if (error.response && error.response.status !== 404) {
      log.error('Cannot check bounced address on Mailgun', error);
    }
  }

  if (!abilityArgs || !abilityArgs.rule) {
    return true;
  }

  const { memberId, rule } = abilityArgs;

  // member
  if (memberId) {
    return !await isUnsubscribed(services, config, { entityName: 'member', identifier: memberId }, ...rule);
  }

  return !await isUnsubscribed(services, config, email, ...rule);
};
