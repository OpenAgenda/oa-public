'use strict';

const _ = require('lodash');
const fields = require('./fields.json');
const schema = require('@openagenda/validators/schema');

schema.register({
  text: require('@openagenda/validators/text')
});

module.exports = schema(fields
  .filter(f => f.write.includes('administrator'))
  .reduce((schema, field) => ({
    ...schema,
    [field.field]: _.omit(field, ['field', 'db', 'read'])
  }), {})
);
