"use strict";

const _ = require('lodash');
const VError = require('verror');

const formatEvent = require('./utils/formatEvent');
const lastTimingEndsIn = require('./utils/lastTimingEndsIn');
const remove = require('./remove');
const getDocumentId = require('./utils/getDocumentId');
const getIndexName = require('./utils/getIndexName');
const log = require('@openagenda/logs')('update');


module.exports = async function(config, set, identifiers, eventPart, options = {}) {
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

  if (!eventPart) {
    throw new Error('data is unavailable');
  }

  let result;

  try {
    result = await client.update({
      index: getIndexName(set, defaultIndex),
      routing: set,
      body: {
        doc: {
          ...formatEvent(eventPart, formSchema),
          _set: set
        }
      },
      id: getDocumentId(set, identifiers.uid),
      refresh
    });
  } catch (err) {
    throw new VError(err, 'failed to update event %s to index of set %s', identifiers.uid, set);
  }

  if (result.body.result === 'updated') {
    log('info', 'event %j was updated in set %s', identifiers, set, {
      operation: 'update',
      set,
      identifiers
    });
  } else {
    log('warn', 'event %j was not updated in set %s', identifiers, set, {
      operation: 'update',
      set,
      identifiers
    });
  }

  return {
    success: result.body.result === 'updated'
  }
}
