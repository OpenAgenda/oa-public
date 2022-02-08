'use strict';

const { transform: makeTransform } = require('@openagenda/stream-utils');
const decorateFieldMap = require('./decorateFieldMap');
const Flattener = require('./Flattener');
const validateOptions = require('./options.validate');

const getDefaultFieldMap = require('./getDefaultFieldMap');

function getFlattener(o = {}) {
  const options = validateOptions(o);

  const { formSchema, maintainedFields } = options;

  const defaultFieldMap = getDefaultFieldMap(options);

  if (!formSchema?.fields) {
    const getHeaders = () => defaultFieldMap.reduce((acc, curr) => {
      acc.push({ source: curr.field || curr.source, target: curr.target });
      return acc;
    }, []);

    return Object.assign(
      Flattener(defaultFieldMap),
      { getHeaders }
    );
  }

  const filteredDefaultFieldMap = formSchema?.fields ? defaultFieldMap.filter(mapItem => {
    const sourceBaseField = mapItem.source.split('.').shift();
    const isInFormSchema = !!formSchema.fields.find(f => f.field === sourceBaseField);
    const isInMaintainedFields = maintainedFields.includes(sourceBaseField);

    return isInFormSchema || isInMaintainedFields;
  }) : defaultFieldMap;

  const decoratedFieldMap = decorateFieldMap(filteredDefaultFieldMap, options);

  const getHeaders = () => decoratedFieldMap.reduce((acc, curr) => {
    acc.push({ source: curr.field || curr.source, target: curr.target });
    return acc;
  }, []);

  return Object.assign(
    Flattener(decoratedFieldMap, options),
    { getHeaders }
  );
}

module.exports = Object.assign(
  (options = {}) => makeTransform(getFlattener(options)),
  {
    getFlattener
  }
);
