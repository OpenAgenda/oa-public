import _ from 'lodash';
import hooksCommon from 'feathers-hooks-common';
import createSchema from '../service/schemas/create.js';
import validate from './validate.js';

const { isProvider } = hooksCommon;

export default function validateCreate() {
  return (context) =>
    validate({
      ...createSchema,
      // Allow server to create an activated user
      ...isProvider('server')(context)
        ? {
          isActivated: {
            type: 'boolean',
            default: false,
          },
        }
        : {},
      // Allow password to be optional for a social registration
      ...['twitterId', 'googleId', 'facebookUid'].some((key) =>
        _.get(context.data, key))
        ? {
          password: {
            type: 'text',
            min: 4,
            optional: true,
          },
        }
        : {},
    })(context);
}
