"use strict";

const VError = require( 'verror' );
const log = require('@openagenda/logs')('deleteIndex');

module.exports = async (config, alias) => {
  let { client } = config;

  let removedIndices = 0, toBeRemoved;

  if (!await client.indices.existsAlias({ name: alias })) {
    throw new VError('no index was found to be removed for alias %s', alias);
  }

  const indices = Object.keys( await client.indices.getAlias( { name: alias } ) );

  toBeRemoved = indices.length;

  while ( indices.length ) {

    let index = indices.pop();

    try {

      await client.indices.delete( { index } );

      removedIndices++;

    } catch( e ) {

      log( 'error', 'could not delete index %s of alias %s: %s', index, alias, e );

    }

  }

  return {
    success: true,
    removedIndices: indices.length
  }
}
