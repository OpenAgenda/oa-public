'use strict';

const _ = require('lodash');
const schema = require('@openagenda/validators/schema');
const text = require('@openagenda/validators/text');
const fields = require('./fields.json');

schema.register({
  text,
});

module.exports = schema(
  fields
    .filter((f) => f.write.includes('administrator'))
    .reduce(
      (result, field) => ({
        ...result,
        [field.field]: _.omit(field, ['field', 'db', 'read']),
      }),
      {},
    ),
);
