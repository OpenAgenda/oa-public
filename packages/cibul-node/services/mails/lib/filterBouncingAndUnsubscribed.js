'use strict';

const _ = require('lodash');
const axios = require('axios');
const logs = require('@openagenda/logs');

const isUnsubscribed = require('./isUnsubscribed');

module.exports = async (services, config, params) => {
  const log = logs('services/mails/filterBouncingAndUnsubscribed');

  const { unsubscriptions } = params.to;
  const abilityArgs = unsubscriptions && unsubscriptions.length
    ? _.find(unsubscriptions, 'memberId') || unsubscriptions[unsubscriptions.length - 1]
    : null;
  const email = params.to.address;

  if (!abilityArgs || !abilityArgs.rule) {
    return true;
  }

  const { memberId, rule } = abilityArgs;

  // member
  if (memberId && await isUnsubscribed(services, config, { entityName: 'member', identifier: memberId }, ...rule)) {
    log('%s: member is unsubscribed. Email filtered', email);
    return false;
  }

  if (await isUnsubscribed(services, config, email, ...rule)) {
    log('%s: user is unsubscribed. Email filtered', email);
    return false;
  }

  if (config.mailgun) {
    const {
      auth: {
        domain,
        apiKey,
      },
    } = config.mailgun;

    try {
      const { data: bounce } = await axios(`https://api.mailgun.net/v3/${domain}/bounces/${email}`, {
        auth: {
          username: 'api',
          password: apiKey,
        },
      });

      if (bounce && bounce.code) {
        return false;
      }
      log('%s did not bounce', email);
    } catch (error) {
      if (error.response && error.response.status !== 404) {
        log.error('Cannot check bounced address on Mailgun', error);
      }
    }
  }

  return true;
};
