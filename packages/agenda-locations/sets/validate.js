'use strict';

const _ = require('lodash');
const schema = require('@openagenda/validators/schema');
const fields = require('./fields.json');

schema.register({
  text: require('@openagenda/validators/text'),
});

module.exports = schema(
  fields
    .filter(f => f.write.includes('administrator'))
    .reduce(
      (schema, field) => ({
        ...schema,
        [field.field]: _.omit(field, ['field', 'db', 'read']),
      }),
      {}
    )
);
