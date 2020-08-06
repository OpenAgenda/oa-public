'use strict';

const _ = require('lodash');

const fields = require('./fields.json');

module.exports = (k, detailed = false) => {
  k.select(_.uniq(fields.filter(f => {
    return detailed || f.read.includes('list');
  }).map(f => f.db || _.snakeCase(f.field))));
}
