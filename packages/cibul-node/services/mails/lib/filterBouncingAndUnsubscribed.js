'use strict';

const _ = require('lodash');

const isUnsubscribed = require('./isUnsubscribed');

module.exports = async (services, config, params) => {
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
  if (memberId) {
    return !await isUnsubscribed(services, config, { entityName: 'member', identifier: memberId }, ...rule);
  }

  return !await isUnsubscribed(services, config, email, ...rule);
};
