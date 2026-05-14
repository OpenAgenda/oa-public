import schema from '@openagenda/validators/schema/index';
import { BadRequest } from '@openagenda/verror';
import hooksCommon from 'feathers-hooks-common';

const { validate: validateHook } = hooksCommon;

export default function validate(_schema) {
  const _validate = schema(_schema);

  return validateHook((values, context) => {
    try {
      context.data = _validate(values);
    } catch (errs) {
      throw new BadRequest({ info: { errors: errs } });
    }
  });
}
