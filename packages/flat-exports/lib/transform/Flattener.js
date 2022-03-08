'use strict';

const _ = require('lodash');

function applyTransform(transformFunction, data, keys, defaultValue = null) {
  return transformFunction.apply(null, [].concat(keys).map(k => _.get(data, k)), defaultValue);
}

function flattenSourceValues(mapItem, src, options) {
  const {
    source,
    transform,
    languages,
    default: defaultItem = null
  } = mapItem;

  const {
    separator = ' | ',
    includeLanguages
  } = options;

  const lang = includeLanguages || languages;

  if (transform instanceof Function) {
    return applyTransform(transform, src, source);
  }

  if (transform) {
    return [].concat(
      _.get(src, source)
    ).map(s => _.get(transform, s, defaultItem || null)).filter(s => s).join(separator);
  }

  if (lang && languages && src[source]) {
    return lang.map(l => src[source][l]);
  }

  return _.get(src, source, defaultItem || null);
}

function flatten(map, src, options = {}) {
  return map.reduce((flattened, mapItem) => {
    const { target } = mapItem;

    const flattenedValue = flattenSourceValues(mapItem, src, options);

    if (_.isArray(target)) {
      Object.assign(flattened, target.reduce((carry, targetField, index) => (flattenedValue && {
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
module.exports.flattenSourceValues = flattenSourceValues;
