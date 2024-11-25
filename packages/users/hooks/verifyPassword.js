import _ from 'lodash';
import errors from '@feathersjs/errors';

export default function verifyPassword(field = 'password') {
  return async (context) => {
    const validPassword = await context.self.verifyPassword(
      { password: _.get(context.data, field) },
      {
        query: { uid: context.id },
      },
    );

    if (!validPassword) {
      throw new errors.BadRequest('Bad password', {
        errors: [
          {
            field,
            code: 'password.badpassword',
          },
        ],
      });
    }
  };
}
