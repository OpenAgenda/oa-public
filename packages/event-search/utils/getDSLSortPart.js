'use strict';

const _ = require('lodash');

module.exports = (sorts = null) => {
  if (![].concat(sorts ? sorts : []).length) {
    return [{
      'timings.end' : {
        mode: 'min',
        order: 'asc',
        nested_path: 'timings',
        nested_filter: {
          range: { 'timings.end' : { gte: 'now' } }
        }
      }
    }, {
      _search_last_timing: { order: 'desc' }
    }]
  }

  return sorts.map(sort => {
    const split = sort.split('.');
    const order = split.pop();
    const field = split.join('.');

    return {
      [field]: order
    };
  });
}
