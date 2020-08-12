'use strict';

const _ = require('lodash');

const fields = require('./fields.json');

module.exports = (k, access, options = {}) => {
  (options.first ? k.first : k.select).bind(k)(_.uniq(fields
    .filter(f => {
      if (f.read.includes(access)) {
        return true;
      }

      const inInclude = options.include && options.include.includes(f.field);

      return inInclude;
    }).map(f => f.db || _.snakeCase(f.field))
  ));
}
