import { BadRequest } from '@openagenda/verror';

export default class ValidationError extends BadRequest {
  constructor(errors) {
    super(
      {
        name: 'ValidationError',
        info: {
          errors: [].concat(errors),
        },
      },
      'Invalid data',
    );
  }
}
