import _ from 'lodash';
import uuid from 'uuid/v4.js';

export default function generateToken(key) {
  return async (context) => {
    const token = uuid().replace(/-/g, '');

    _.set(context, key, token);

    return context;
  };
}
