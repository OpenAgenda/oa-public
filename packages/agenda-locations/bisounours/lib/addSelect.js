'use strict';

const _ = require('lodash');

const fields = require('./fields.json');

module.exports = (k, access, options = {}) => {

  (options.first ? k.first : k.select).bind(k)(_.uniq(fields
    .filter(f => f.read.includes(access))
    .map(f => f.db || _.snakeCase(f.field))
  ));
}
