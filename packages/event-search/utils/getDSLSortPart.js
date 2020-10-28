'use strict';

const _ = require('lodash');

module.exports = (s = []) => {
  const sorts = [].concat(s);

  if (!sorts.length) {
    sorts.push('timings.asc');
  }

  if (sorts[0] === 'score') return null;

  if (sorts[0].split('.')[0] === 'timings') {
    return [{
      'timings.end' : {
        mode: 'min',
        order: 'asc',
        nested_path: 'timings',
        nested_filter: {
          range: {
            'timings.end' : { 'gte': 'now' }
          }
        }
      }
    }, {
      _search_last_timing: { order: 'desc' }
    }, {
      uid: { order: 'asc' } // tie breaker
    }];
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
