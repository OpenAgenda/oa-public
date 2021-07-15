'use strict';

const { transform: makeTransform } = require('@openagenda/stream-utils');
const decorateFieldMap = require('./decorateFieldMap');
const Flattener = require('./Flattener');

const getDefaultFieldMap = require('./getDefaultFieldMap');

function getFlattener(options = {}) {
  const defaultFieldMap = getDefaultFieldMap(options);

  if (!options.formSchema?.fields) {
    return Flattener(defaultFieldMap);
  }

  const filteredDefaultFieldMap = options.formSchema?.fields ? defaultFieldMap.filter(mapItem => (
    options.formSchema.fields.find(f => f.field === mapItem.source.split('.').shift())
  )) : defaultFieldMap;

  return Flattener(decorateFieldMap(filteredDefaultFieldMap, options), options);
}

module.exports = Object.assign(
  (options = {}) => makeTransform(getFlattener(options)),
  {
    getFlattener
  }
);
