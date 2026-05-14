import schema from '@openagenda/validators/schema/index';
import choice from '@openagenda/validators/choice';
import textValidator from '@openagenda/validators/text';
import booleanValidator from '@openagenda/validators/boolean';
import linkValidator from '@openagenda/validators/link';
import numberValidator from '@openagenda/validators/number';
import dateValidator from '@openagenda/validators/date';
import multilingualValidator from '@openagenda/validators/multilingual';
import integerValidator from '@openagenda/validators/integer';
import passValidator from '@openagenda/validators/pass';
import fileValidator from './fileValidator.js';
import getSchemaArgs from './getSchemaArgs.js';

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

export default (fields, accessType, accessLevel, options) =>
  schema(getSchemaArgs(fields, accessType, accessLevel, options));
