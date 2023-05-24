import VError from '@openagenda/verror';
import getFormErrors from './getAjvFormErrors';

export default function validate(ajv, schemaId, data) {
  const valid = ajv.validate(schemaId, data);

  if (!valid) {
    throw new VError({
      name: 'ValidationError',
      info: {
        errors: getFormErrors(ajv.errors.slice()),
        data,
      },
    });
  }

  return true;
}
