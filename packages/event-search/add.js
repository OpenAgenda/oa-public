'use strict';

const _ = require('lodash');
const VError = require('verror');
const formatEvent = require('./utils/formatEvent');
const lastTimingEndsIn = require('./utils/lastTimingEndsIn');
const getDocumentId = require('./utils/getDocumentId');
const getIndexName = require('./utils/getIndexName');

const log = require('@openagenda/logs')('add');

module.exports = async function(config, set, event, options = {}) {
  const {
    refresh,
    formSchema
  } = {
    refresh: false,
    formSchema: null,
    ...options
  };

  const {
    client,
    defaultIndex
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
      body: {
        ...formatEvent(event, formSchema),
        _set: set
      }
    });
  } catch (err) {
    throw new VError(err, 'failed to add event to index');
  }

  if (result.body.result === 'created') {
    log('info', 'event %j was added to set %s', { uid: event.uid }, set, {
      operation: 'add',
      set,
      identifiers: { uid: event.uid }
    });
  } else {
    log('warn', 'event %j was not added to set %s', event.uid, set, {
      operation: 'add',
      set,
      identifiers: { uid: event.uid },
      result
    });
  }

  return {
    success: result.body.result === 'created'
  }
}
