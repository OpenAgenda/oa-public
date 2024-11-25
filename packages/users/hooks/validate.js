import schema from '@openagenda/validators/schema/index.js';
import errors from '@feathersjs/errors';
import hooksCommon from 'feathers-hooks-common';

const { validate: validateHook } = hooksCommon;

export default function validate(_schema) {
  const _validate = schema(_schema);

  return validateHook((values, context) => {
    try {
      context.data = _validate(values);
    } catch (errs) {
      throw new errors.BadRequest({ errors: errs });
    }
  });
}
