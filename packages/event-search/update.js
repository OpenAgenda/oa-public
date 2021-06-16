"use strict";

const _ = require('lodash');
const VError = require('@openagenda/verror');

const formatEvent = require('./utils/formatEvent');
const getDocumentId = require('./utils/getDocumentId');
const getIndexName = require('./utils/getIndexName');
const log = require('@openagenda/logs')('update');

module.exports = async function(config, set, identifiers, eventPart, options = {}) {
  const {
    refresh = false,
    formSchema = null
  } = options;

  const {
    client,
    defaultIndex,
    interfaces
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
          ...formatEvent(eventPart, { formSchema }),
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
    if (interfaces?.onUpdate) {
      try {
        interfaces.onUpdate({ identifiers, set });
      } catch (e) {}
    }
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
