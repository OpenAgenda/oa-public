// IMPORTANT: this file is used on server side also, should be in ES5.

const _ = require('lodash');

function formatAttrValue(value) {
  switch (value) {
    case null:
      return 'null';
    case true:
      return 'true';
    case false:
      return 'false';
    default:
      return value;
  }
}

module.exports = function formatFilterAttrs(dataset, prefix = 'data-oa-filter-') {
  const attrs = {};

  for (const [name, value] of Object.entries(dataset)) {
    const keyPath = _.kebabCase(name);
    const formattedValue = ['options', 'fieldSchema', 'query'].includes(name) && typeof value !== 'string'
      ? JSON.stringify(value)
      : formatAttrValue(value);

    _.set(attrs, `${prefix}${keyPath}`, formattedValue);
  }

  return attrs;
};
