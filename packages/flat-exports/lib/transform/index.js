import streamUtils from '@openagenda/stream-utils';
import formSchemas from '@openagenda/form-schemas';
import decorateFieldMap from './decorateFieldMap.js';
import Flattener from './Flattener.js';
import validateOptions from './options.validate.js';
import getDefaultFieldMap from './getDefaultFieldMap.js';

const { transform: makeTransform } = streamUtils;
const { flattenSchema: getFlattenedSchema } = formSchemas.utils;

export function getFlattener(o = {}) {
  const options = validateOptions(o);

  const { formSchema, maintainedFields } = options;

  const defaultFieldMap = getDefaultFieldMap(options);

  if (!formSchema?.fields) {
    const getHeaders = () =>
      defaultFieldMap.reduce((acc, curr) => {
        acc.push({
          source: curr.field || curr.source,
          target: curr.target,
          hasOptions: curr.hasOptions || false,
        });
        return acc;
      }, []);

    return Object.assign(Flattener(defaultFieldMap), { getHeaders });
  }

  const flattenedFormSchema = getFlattenedSchema(formSchema);

  const filteredDefaultFieldMap = flattenedFormSchema?.fields
    ? defaultFieldMap.filter((mapItem) => {
      const { source } = mapItem;
      const isInFormSchema = !!flattenedFormSchema.fields.find(
        (f) => f.field === source,
      );

      const isInMaintainedFields = maintainedFields.includes(source);

      return isInFormSchema || isInMaintainedFields;
    })
    : defaultFieldMap;

  const decoratedFieldMap = decorateFieldMap(filteredDefaultFieldMap, options);

  const getHeaders = () =>
    decoratedFieldMap.map((item) => ({
      source: item.field || item.source,
      target: item.target,
      hasOptions: item.hasOptions || false,
    }));

  return Object.assign(Flattener(decoratedFieldMap, options), { getHeaders });
}

export default (options = {}) => makeTransform(getFlattener(options));
