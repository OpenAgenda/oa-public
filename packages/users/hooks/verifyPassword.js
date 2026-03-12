import _ from 'lodash';
import { BadRequest } from '@openagenda/verror';

export default function verifyPassword(field = 'password') {
  return async (context) => {
    const validPassword = await context.self.verifyPassword(
      { password: _.get(context.data, field) },
      {
        query: { uid: context.id },
      },
    );

    if (!validPassword) {
      throw new BadRequest(
        {
          info: {
            errors: [
              {
                field,
                code: 'password.badpassword',
              },
            ],
          },
        },
        'Bad password',
      );
    }
  };
}
