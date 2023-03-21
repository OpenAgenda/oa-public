'use strict';

const diff = require('deep-diff');

const log = require('@openagenda/logs')('utils/updateMapping');

module.exports = async ({ client }, index, mapping, options = {}) => {
  const currentMapping = await client.indices
    .getMapping({ index })
    .then(({ body }) => body[index].mappings.properties);

  const newFields = diff(
    currentMapping,
    mapping,
  ).filter(d => d.kind === 'N').map(d => d.path.shift());

  if (!options.force && !newFields.length) {
    log('no new fields, no need to update');
    return;
  }

  const amendedMapping = newFields.reduce((amended, field) => ({
    ...amended,
    [field]: mapping[field],
  }), currentMapping);

  const response = client.indices.putMapping({
    index,
    body: {
      dynamic: false,
      properties: options.force ? mapping : amendedMapping,
    },
  }).then(r => r.body);

  log('info', 'updated mapping with %j', options.force ? mapping : newFields);

  return response;
};
