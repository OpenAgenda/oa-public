'use strict';

const _ = require('lodash');
const errors = require('@feathersjs/errors');

module.exports = function checkUnicity(field, dataKey = `data.${field}`) {
  return async context => {
    if (!_.get(context, dataKey)) {
      return;
    }

    const result = await context.service.find({
      query: {
        [ field ]: _.get(context, dataKey),
        $limit: 0
      }
    });

    if (result.total !== 0) {
      throw new errors.BadRequest('Already exist');
    }
  };
};
