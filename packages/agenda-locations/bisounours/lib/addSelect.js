'use strict';

const _ = require('lodash');

const fields = require('./fields.json');

module.exports = (k, access, options = {}) => {
  (options.first ? k.first : k.select).bind(k)(_.uniq(fields
    .filter(f => {
      if (options.include && options.include.includes(f.field)) {
        return true;
      }
      if (!f.read.includes(access)) {
        return false;
      }
      if (options.includeFields && options.includeFields.length) {
        return options.includeFields.includes(f.field);
      }
      return true;
    }).map(f => f.db || _.snakeCase(f.field))
  ));
}
