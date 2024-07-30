import AJV from 'ajv';
import { BadRequest } from '@openagenda/verror';

const ajv = new AJV();

const validate = ajv.compile({
  type: 'string',
  maxLength: 255,
  minLength: 1,
});

export default value => {
  if (!validate(value)) {
    throw new BadRequest('is not a string of length between 1 and 255 characters');
  }
};
