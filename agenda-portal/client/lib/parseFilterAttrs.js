// IMPORTANT: this file is used on server side also, should be in ES5.

const _ = require('lodash');

function parseAttrValue(value) {
  switch (value) {
    case 'null':
      return null;
    case 'true':
      return true;
    case 'false':
      return false;
    default:
      return value;
  }
}

module.exports = function parseFilterAttrs(attrs) {
  const dataset = {};

  for (const [name, value] of Object.entries(attrs)) {
    const keyPath = name.split('--').map(_.camelCase).join('.');
    const parsedValue = ['params', 'options', 'fieldSchema', 'query'].includes(keyPath) && typeof value === 'string'
      ? JSON.parse(value)
      : parseAttrValue(value);

    if (keyPath === 'params') {
      Object.assign(dataset, parsedValue);
    } else {
      _.set(dataset, keyPath, parsedValue);
    }
  }

  return dataset;
};