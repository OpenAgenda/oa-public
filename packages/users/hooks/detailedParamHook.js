'use strict';

const _ = require('lodash');
const _fields = require('../service/fields');

module.exports = function detailedParamHook() {
  return context => {
    context.params.query = context.params.query || {};

    if (context.params.internal !== true) {
      const fields = context.params.detailed
        ? [..._fields.basic, ..._fields.detailed]
        : _fields.basic;
      context.params.query.$select = fields.map(_.snakeCase);
    }

    return context;
  };
};
