import debug from 'debug';
import { validators } from '@openagenda/event-form/build';
import FormSchema from '@openagenda/form-schemas/iso/FormSchema';

const log = debug('getUneditableStandardFieldConstraints');

export default function getUneditableStandardFieldConstraints({ schema }, event) {
  const standardValidationErrors = [];

  log(schema.fields.filter(f => f.schemaType === 'event'));

  const validate = new FormSchema({
    custom: validators,
    fields: schema.fields.filter(f => f.schemaType === 'event'),
  }).getValidate();

  try {
    validate(event);
  } catch (errors) {
    errors.forEach(error => standardValidationErrors.push(error));
  }

  if (!standardValidationErrors.length) {
    log('event is valid according to standard fields constraints');
    return [];
  }

  log('There are %s validation errors on standard form of destination agenda', standardValidationErrors.length);

  return standardValidationErrors.map(error => ({
    ...error,
    codeLabel: 'L\'erreur',
    fieldLabel: 'Le champ',
  }));
}
