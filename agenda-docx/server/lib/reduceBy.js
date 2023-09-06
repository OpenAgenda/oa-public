'use strict';

const _ = require('lodash');
const get = require('./get');
const sortBy = require('./sortBy');

module.exports = (items, path, opts = {}) => {
  const options = _.defaults(opts, {
    hoist: [],
    childrenKey: 'items',
    targetKey: path,
  });

  const byKey = {};

  items.forEach(item => {
    const keyValue = get(item, path);

    (Array.isArray(keyValue) ? keyValue : [keyValue]).forEach(key => {
      if (byKey[key] === undefined) {
        byKey[key] = {};
        byKey[key][options.targetKey] = key;
        byKey[key][options.childrenKey] = [];

        options.hoist.forEach(({ source, target }) => {
          _.set(byKey[key], target, get(item, source));
        });
      }

      byKey[key][options.childrenKey].push(item);
    });
  });

  let keys = _.keys(byKey);

  if (options.sortBy) {
    keys = sortBy(keys, options.sortBy, (item, sortByKey) => _.get(byKey[item], sortByKey));
  }

  const result = keys.map(k => byKey[k]);

  return result.map(item => {
    if (options.childrenKey && options.sortChildrenBy) {
      item[options.childrenKey] = sortBy(
        item[options.childrenKey],
        options.sortChildrenBy
      );
    }

    return item;
  });
};
