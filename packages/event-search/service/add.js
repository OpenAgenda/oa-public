'use strict';

const preParse = require('./index/preParse');
const clean = require('./helpers/clean');
const lastTimingEndsIn = require('./helpers/lastTimingEndsIn');
const handleError = require('./helpers/handleError');
const _ = require('lodash');
const log = require('@openagenda/logs')('add');

module.exports = async function(config, alias, event, options = {}) {
  const params = Object.assign({
    refresh: false
  }, options);

  const { client } = config;

  const cleanEvent = clean(event);

  let result;

  try {
    result = await client.index({
      index: alias,
      refresh: params.refresh,
      id: cleanEvent.uid,
      body: preParse(cleanEvent)
    });
  } catch (err) {
    return handleError(config, err, 'failed to add event to index');
  }

  if (result.body.result === 'created') {
    log('info', 'event %j was added to alias %s', { uid: event.uid }, alias, {
      operation: 'add',
      alias,
      identifiers: { uid: event.uid }
    });
  } else {
    log('warn', 'event %j was not added to alias %s', event.uid, alias, {
      operation: 'add',
      alias,
      identifiers: { uid: event.uid },
      result
    });
  }

  return {
    success: result.body.result === 'created'
  }
}
