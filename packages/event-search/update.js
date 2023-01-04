'use strict';

const logs = require('@openagenda/logs');

const {
  BadRequest,
} = require('@openagenda/verror');

const formatEvent = require('./utils/formatEvent');
const getDocumentId = require('./utils/getDocumentId');
const getIndexName = require('./utils/getIndexName');

const log = logs('update');
const validateOptions = require('./utils/validateUpdateOptions');

const ESToVerror = require('./utils/ESToVerror');

module.exports = async function update(config, set, identifiers, eventPart, options = {}) {
  const {
    refresh,
    formSchema,
    operation,
  } = validateOptions(options);

  const {
    client,
    defaultIndex,
    interfaces,
  } = config;

  if (!eventPart) {
    throw new BadRequest({
      info: { set, identifiers },
    }, 'no data was provided');
  }

  let result;

  try {
    const doc = {
      ...formatEvent(eventPart, { formSchema }),
      _set: set,
    };
    result = await client[operation]({
      index: getIndexName(set, defaultIndex),
      routing: set,
      body: operation === 'update' ? { doc } : doc,
      id: getDocumentId(set, identifiers.uid),
      refresh,
    });
  } catch (err) {
    throw ESToVerror(err, 'failed to update event');
  }

  let success = false;

  if (operation === 'update' && (result.body.result === 'updated')) {
    log('info', 'event %j was updated in set %s', identifiers, set, {
      operation: 'update',
      set,
      identifiers,
    });
    success = true;
  } else if (operation === 'index' && ['created', 'updated'].includes(result.body.result)) {
    log('info', 'event %j was %s in set %s', result.body.result, identifiers, set, {
      operation,
      set,
      identifiers,
    });
    success = true;
  } else {
    log('warn', 'event %j was not %s in set %s', operation === 'update' ? 'updated' : 'indexed', identifiers, set, {
      operation,
      set,
      identifiers,
    });
  }

  if (success) {
    if (interfaces?.onUpdate) {
      try {
        interfaces.onUpdate({ identifiers, set });
      } catch (e) {
        // console.log(e);
      }
    }
  }

  return {
    success,
  };
};
