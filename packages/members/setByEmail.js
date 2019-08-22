'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('setByEmail');
const getByEmail = require('./get').byEmail;
const patch = require('./patch');
const create = require('./create');
const { isSuperiorTo } = require('./lib/compareRoles');

const defaultQueueName = 'membersBulkSetEmails';

async function setByEmail(config, data, options = {}) {
  if (!_.get(data, 'agendaUid')) {
    throw new Error('Bad payload: agendaUid is missing');
  }

  const member = await getByEmail(config, _.pick(data, ['agendaUid', 'email']));

  const userUid = _.get(member, 'userUid')
    || (config.interfaces
      && config.interfaces.getUserByEmail
      && (await config.interfaces
        .getUserByEmail(data.email)
        .then(u => (u ? u.uid : null))));

  const clean = {};

  if (!_.get(member, 'userUid') && userUid) {
    clean.userUid = userUid;
  }

  if (!member || isSuperiorTo(_.get(data, 'role'), member.role)) {
    clean.role = data.role;
  }

  if (member && Object.keys(clean).length) {
    return {
      ...(await patch(config, member.id, clean, options)),
      operation: 'patch'
    };
  }
  if (member) {
    log('info', 'nothing done for member %s', member.id);
    return {
      operation: null
    };
  }
  return {
    ...(await create(
      config,
      {
        agendaUid: data.agendaUid,
        ...clean,
        custom: { email: data.email }
      },
      options
    )),
    operation: 'create'
  };
}

function _logQueue(queue) {
  queue.on('error', (fn, args, error) => {
    log('error', fn, args, error);
  });
  queue.on('execute', (fn, args) => {
    log('executing', fn, args);
  });
  queue.on('success', (fn, args, result) => {
    log('success', fn, args, result);
  });
}

function task(config) {
  const { queues, queueName } = {
    queues: null,
    queueName: defaultQueueName,
    ...config
  };

  const queue = queues(queueName);

  queue.register({
    setByEmail: setByEmail.bind(null, config)
  });

  _logQueue(queue);

  queue.run();
}

async function bulk(config, base, emails = [], options = {}) {
  log('bulk');

  const { bulkThreshold, queues, queueName } = {
    queues: null,
    queueName: defaultQueueName,
    bulkThreshold: 10,
    ...config
  };

  const queue = queues(queueName);

  _logQueue(queue);

  const queueJobs = emails.length > bulkThreshold;

  const result = {
    queued: queueJobs ? emails.length : 0,
    processed: []
  };

  log(queueJobs ? 'queueing' : 'processing without queueing');

  for (const email of emails) {
    const data = { ...base, email };

    if (queueJobs) {
      await queue('setByEmail', data, options);
    } else {
      result.processed.push(await setByEmail(config, data, options));
    }
  }

  return result;
}

module.exports = Object.assign(setByEmail, {
  task,
  bulk
});
