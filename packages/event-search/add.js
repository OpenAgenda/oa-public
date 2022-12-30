'use strict';

const VError = require('@openagenda/verror');
const logs = require('@openagenda/logs');
const formatEvent = require('./utils/formatEvent');
const getDocumentId = require('./utils/getDocumentId');
const getIndexName = require('./utils/getIndexName');

const log = logs('add');

module.exports = async function add(config, set, event, options = {}) {
  const {
    refresh = false,
    formSchema = null,
  } = options;

  const {
    client,
    defaultIndex,
  } = config;

  if (!event) {
    throw new Error('data is unavailable');
  }

  let result;

  try {
    result = await client.index({
      index: getIndexName(set, defaultIndex),
      refresh,
      id: getDocumentId(set, event.uid),
      routing: set,
      body: {
        ...formatEvent(event, { formSchema }),
        _set: set,
      },
    });
  } catch (err) {
    throw new VError(err, 'failed to add event to index');
  }

  const logPayload = {
    operation: 'add',
    set,
    identifiers: { uid: event.uid },
  };

  if (result.body.result === 'created') {
    log('info', 'event %j was added to set %s', { uid: event.uid }, set, logPayload);
  } else if (result.body.result === 'updated') {
    log('info', 'event %j was already on set %s and was updated', { uid: event.uid }, set, logPayload);
  } else {
    log('warn', 'event %j was not added to set %s', event.uid, set, {
      ...logPayload,
      result,
    });
  }

  return {
    success: result.body.result === 'created',
  };
};
