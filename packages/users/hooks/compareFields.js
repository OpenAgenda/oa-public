import _ from 'lodash';
import errors from '@feathersjs/errors';

export default function compareFields(
  field1,
  field2,
  errorCode = 'confirmation.differentpassword',
) {
  return (context) => {
    if (_.get(context.data, field1) !== _.get(context.data, field2)) {
      throw new errors.BadRequest('Bad password', {
        errors: [
          {
            field: field2,
            code: errorCode,
          },
        ],
      });
    }
  };
}
