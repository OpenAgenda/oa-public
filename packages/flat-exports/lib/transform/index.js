'use strict';

const { transform: makeTransform } = require('@openagenda/stream-utils');
const decorateFieldMap = require('./decorateFieldMap');
const Flattener = require('./Flattener');

const getDefaultFieldMap = require('./getDefaultFieldMap');

function getFlattener(options = {}) {
  const {
    formSchema = null,
    maintainedFields = []
  } = options;

  const defaultFieldMap = getDefaultFieldMap(options);

  if (!formSchema?.fields) {
    return Flattener(defaultFieldMap);
  }

  const filteredDefaultFieldMap = formSchema?.fields ? defaultFieldMap.filter(mapItem => {
    const sourceBaseField = mapItem.source.split('.').shift();
    const isInFormSchema = !!formSchema.fields.find(f => f.field === sourceBaseField);
    const isInMaintainedFields = maintainedFields.includes(sourceBaseField);

    return isInFormSchema || isInMaintainedFields;
  }) : defaultFieldMap;

  return Flattener(decorateFieldMap(filteredDefaultFieldMap, options), options);
}

module.exports = Object.assign(
  (options = {}) => makeTransform(getFlattener(options)),
  {
    getFlattener
  }
);
