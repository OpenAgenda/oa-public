import schema from '@openagenda/validators/schema/index.js';
import choice from '@openagenda/validators/choice.js';
import textValidator from '@openagenda/validators/text.js';
import booleanValidator from '@openagenda/validators/boolean.js';
import linkValidator from '@openagenda/validators/link.js';
import numberValidator from '@openagenda/validators/number.js';
import dateValidator from '@openagenda/validators/date.js';
import multilingualValidator from '@openagenda/validators/multilingual.js';
import integerValidator from '@openagenda/validators/integer.js';
import passValidator from '@openagenda/validators/pass.js';
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
  choice
});
export default (fields, accessType, accessLevel, options) => schema(getSchemaArgs(fields, accessType, accessLevel, options));
//# sourceMappingURL=getSchema.js.map