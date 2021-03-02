'use strict';

const schema = require('@openagenda/validators/schema');
const getSchemaArgs = require('./getSchemaArgs');

schema.register({
  text: require('@openagenda/validators/text'),
  boolean: require('@openagenda/validators/boolean'),
  link: require('@openagenda/validators/link'),
  number: require('@openagenda/validators/number'),
  date: require('@openagenda/validators/date'),
  multilingual: require('@openagenda/validators/multilingual'),
  integer: require('@openagenda/validators/integer'),
  choice: require('@openagenda/validators/choice'),
  pass: require('@openagenda/validators/pass'),
  file: require('./fileValidator')
});

module.exports = (fields, accessType, accessLevel, options) => {
  return schema(
    getSchemaArgs(fields, accessType, accessLevel, options)
  );
}