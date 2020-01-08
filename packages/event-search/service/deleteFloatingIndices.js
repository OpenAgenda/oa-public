'use strict';

const log = require('@openagenda/logs')('deleteFloatingIndices');

module.exports = async ({ client }) => {
  const indices= await client.cat.indices({
    format: 'json',
    h: 'index'
  }).then(({ body }) => body.map(r => r.index));

  const associatedIndices = await client.cat.aliases({
    format: 'json'
  }).then(r => r.body.map(a => a.index));

  const floatingIndices = indices.filter(i => !associatedIndices.includes(i));

  for (const index of floatingIndices) {
    await client.indices.delete({ index });
    log('deleted index %s', index);
  }

  return floatingIndices;
}
