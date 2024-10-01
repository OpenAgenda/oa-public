import AJV from 'ajv';
import { BadRequest } from '@openagenda/verror';

const ajv = new AJV();

const validate = ajv.compile({
  type: 'string',
  format: 'email',
});

export default (value) => {
  if (!validate(value)) {
    throw new BadRequest('is not email');
  }
};
