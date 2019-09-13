'use strict';

const _ = require('lodash');
const uuid = require('uuid/v4');

module.exports = function generateUniqueToken(key) {
  return async context => {
    const token = uuid();

    const query = {};

    _.set(query, key, token);

    const result = await context.service.findOne({ query });

    if (result) {
      return generateUniqueToken(key)(context);
    }

    _.set(context.data, key, token);

    return context;
  };
};
