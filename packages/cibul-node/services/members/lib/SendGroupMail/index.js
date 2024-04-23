'use strict';

const log = require('@openagenda/logs')('services/members/sendGroupMail');

const task = require('./task');
const launchSend = require('./launchSend');

const queueName = 'memberMessages';

module.exports = function SendGroupMail(config, services) {
  const {
    bull,
  } = services;

  if (!bull) {
    log.warn('bull service is not initialized. Sending group mail will be deactivated');
  }

  const queue = bull ? new bull.Queue(queueName, { prefix: `{${queueName}}` }) : null;

  return Object.assign(
    (agenda, senderMember, query, data, options) => launchSend(queue, agenda, senderMember, query, data, options),
    {
      task: () => task({ config, queue, services }),
      clear: () => queue.obliterate(),
    },
  );
};
