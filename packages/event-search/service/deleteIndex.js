"use strict";

const VError = require( 'verror' );
const log = require('@openagenda/logs')('deleteIndex');
const getAlias = require('./helpers/getAlias');

module.exports = async (config, alias) => {
  const { client } = config;
  let removedIndices = 0;

  if (!await client.indices.existsAlias({ name: alias }).then(r => r.body)) {
    throw new VError('no index was found to be removed for alias %s', alias);
  }

  const indices = await getAlias(client, alias);

  while (indices.length) {
    const index = indices.pop();

    try {
      await client.indices.delete({ index });
      removedIndices++;
    } catch(e) {
      log('error', 'could not delete index %s of alias %s: %s', index, alias, e);
    }
  }

  return {
    success: true,
    removedIndices: indices.length
  }
}
