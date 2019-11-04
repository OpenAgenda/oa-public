"use strict";

const _ = require( 'lodash' );
const handleError = require( './helpers/handleError' );
const lastTimingEndsIn = require( './helpers/lastTimingEndsIn' );
const parseQuery = require( './query' );
const remove = require( './remove' );
const parseDoc = require( './index/preParse' );
const log = require( '@openagenda/logs' )( 'update' );


module.exports = async function(config, alias, identifiers, eventPart, options = {} ) {
  const params = Object.assign({
    refresh: false,
    expire: false
  }, options);

  const { client, type } = config;

  let ttl, lastTimingEndsInDays, res;

  if (params.expire && eventPart.timings) {
    lastTimingEndsInDays = lastTimingEndsIn(eventPart);
    ttl = lastTimingEndsInDays + 'd';
  }

  if ( lastTimingEndsInDays !== undefined && lastTimingEndsInDays < 0 ) {
    try {
      return remove(config, alias, identifiers, options);
    } catch ( err ) {
      return handleError(config, err, 'failed to remove past event %s in index of alias %s', identifiers.uid, alias );
    }
  }

  try {
    res = await client.update({
      index: alias,
      type,
      body: {
        doc: parseDoc(eventPart, true)
      },
      id: identifiers.uid,
      refresh: params.refresh,
      ttl
    });
  } catch (err) {
    return handleError(config,  err, 'failed to update event %s in index of alias %s', identifiers.uid, alias);
  }

  if (res.result === 'updated') {
    log('info', 'event %j was updated in alias %s', identifiers, alias, {
      operation: 'update',
      alias,
      identifiers
    });
  } else {
    log('warn', 'event %j was not updated in alias %s', identifiers, alias, {
      operation: 'update',
      alias,
      identifiers
    });
  }

  return {
    success: res.result === 'updated',
    ttl
  }
}
