import _ from 'lodash';

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

export default {
  init,
  increment,
};
