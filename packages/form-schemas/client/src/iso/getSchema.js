const schema = require('@openagenda/validators/schema');
const choice = require('@openagenda/validators/choice');
const textValidator = require('@openagenda/validators/text');
const booleanValidator = require('@openagenda/validators/boolean');
const linkValidator = require('@openagenda/validators/link');
const numberValidator = require('@openagenda/validators/number');
const dateValidator = require('@openagenda/validators/date');
const multilingualValidator = require('@openagenda/validators/multilingual');
const integerValidator = require('@openagenda/validators/integer');
const passValidator = require('@openagenda/validators/pass');

const fileValidator = require('./fileValidator');
const getSchemaArgs = require('./getSchemaArgs');

schema.register({
  text: textValidator,
  boolean: booleanValidator,
  link: linkValidator,
  number: numberValidator,
  date: dateValidator,
  multilingual: multilingualValidator,
  integer: integerValidator,
  pass: passValidator,
  file: fileValidator,
  choice,
});

module.exports = (fields, accessType, accessLevel, options) => schema(
  getSchemaArgs(fields, accessType, accessLevel, options),
);
