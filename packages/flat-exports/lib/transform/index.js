'use strict';

const { transform: makeTransform } = require('@openagenda/stream-utils');

const {
  utils: {
    flattenSchema: getFlattenedSchema,
  },
} = require('@openagenda/form-schemas');

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
      acc.push({ source: curr.field || curr.source, target: curr.target, hasOptions: curr.hasOptions || false });
      return acc;
    }, []);

    return Object.assign(
      Flattener(defaultFieldMap),
      { getHeaders },
    );
  }

  const flattenedFormSchema = getFlattenedSchema(formSchema);

  const filteredDefaultFieldMap = flattenedFormSchema?.fields ? defaultFieldMap.filter(mapItem => {
    const {
      source,
    } = mapItem;
    const isInFormSchema = !!flattenedFormSchema.fields.find(f => f.field === source);

    const isInMaintainedFields = maintainedFields.includes(source);

    return isInFormSchema || isInMaintainedFields;
  }) : defaultFieldMap;

  const decoratedFieldMap = decorateFieldMap(filteredDefaultFieldMap, options);

  const getHeaders = () => decoratedFieldMap.map(item => ({
    source: item.field || item.source,
    target: item.target,
    hasOptions: item.hasOptions || false,
  }));

  return Object.assign(
    Flattener(decoratedFieldMap, options),
    { getHeaders },
  );
}

module.exports = Object.assign(
  (options = {}) => makeTransform(getFlattener(options)),
  {
    getFlattener,
  },
);
