import _ from 'lodash';
import uuid from 'uuid/v4.js';

export default function generateUniqueToken(key) {
  return async (context) => {
    const token = uuid();

    const query = {};

    _.set(query, key, token);

    const result = await context.self.findOne({ query });

    if (result) {
      return generateUniqueToken(key)(context);
    }

    _.set(context.data, key, token);

    return context;
  };
}
