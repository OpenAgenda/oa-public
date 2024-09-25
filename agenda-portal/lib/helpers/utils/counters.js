'use strict';

const _ = require('lodash');

function init(data) {
  if (!data.root.__filtersAndWidgetsCounter) {
    data.root.__filtersAndWidgetsCounter = {
      filters: {},
      widgets: {},
    };
  }
}

function increment(data, key, name) {
  const namespace = `root.__filtersAndWidgetsCounter.${key}.${name}`;
  const value = _.get(data, namespace, -1) + 1;
  _.set(data, namespace, value);
  return value;
}

module.exports = {
  init,
  increment,
};
