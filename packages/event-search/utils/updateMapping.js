'use strict';

const log = require('@openagenda/logs')('utils/updateMapping');

module.exports = async ({ client }, index, mapping) => {
  const currentMapping = await client.indices
    .getMapping({ index })
    .then(({ body }) => body[index].mappings.properties);

  const currentFields = Object.keys(currentMapping);
  const newFields = Object.keys(mapping).filter(f => !currentFields.includes(f));

  if (!newFields.length) {
    log('no new fields, no need to update');
    return;
  }

  const amendedMapping = newFields.reduce((amended, field) => ({
    ...amended,
    [field]: mapping[field]
  }), currentMapping);

  const response = client.indices.putMapping({
    index,
    body: {
      dynamic: false,
      properties: amendedMapping
    }
  }).then(r => r.body);

  log('info', 'updated mapping with %j', newFields);

  return response;
}
