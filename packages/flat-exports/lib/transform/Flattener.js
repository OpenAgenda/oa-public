'use strict';

const _ = require('lodash');

function applyTransform(transformFunction, data, keys, defaultValue = null) {
  return transformFunction.apply(null, [].concat(keys).map(k => _.get(data, k)), defaultValue);
}

function flatten(map, src, options = {}) {
  const {
    separator = ' | '
  } = options;

  return map.reduce((flattened, mapItem) => {
    const {
      source,
      target,
      transform,
      languages,
      default: defaultItem = null
    } = mapItem;

    let flattenedValue;
    if (transform instanceof Function) {
      flattenedValue = applyTransform(transform, src, source);
    } else if (transform) {
      flattenedValue = [].concat(
        _.get(src, source)
      ).map(s => _.get(transform, s, defaultItem || null)).join(separator);
    } else if (languages) {
      flattenedValue = languages.map(l => src[source][l]);
    } else {
      flattenedValue = _.get(src, source, defaultItem || null);
    }

    if (_.isArray(target)) {
      Object.assign(flattened, target.reduce((carry, targetField, index) => ({
        ...carry,
        [targetField]: flattenedValue[index] || null
      }), {}));
    } else {
      flattened[target] = flattenedValue;
    }
    return flattened;
  }, {});
}

module.exports = (map, options) => src => flatten(map, src, options);

module.exports.flatten = flatten;
