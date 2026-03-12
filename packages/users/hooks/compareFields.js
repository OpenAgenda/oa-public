import _ from 'lodash';
import { BadRequest } from '@openagenda/verror';

export default function compareFields(
  field1,
  field2,
  errorCode = 'confirmation.differentpassword',
) {
  return (context) => {
    if (_.get(context.data, field1) !== _.get(context.data, field2)) {
      throw new BadRequest(
        {
          info: {
            errors: [
              {
                field: field2,
                code: errorCode,
              },
            ],
          },
        },
        'Bad password',
      );
    }
  };
}
