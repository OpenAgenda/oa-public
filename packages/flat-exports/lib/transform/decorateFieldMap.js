import VError from '@openagenda/verror';
import formSchemas from '@openagenda/form-schemas';
import fieldToFlattenerMapItem from './fieldToFlattenerMapItem.js';

const { flattenSchema: getFlattenedSchema } = formSchemas.utils;

const handledTypes = [
  'text',
  'integer',
  'number',
  'email',
  'phone',
  'link',
  'html',
  'markdown',
  'textarea',
  'multilingual',
  'latitude',
  'longitude',
  'boolean',
  'date',
  'address',
];

const isIncluded = (fieldMap, includeFields, f) =>
  includeFields.some(
    (includeField) =>
      includeField === f.field
      && !fieldMap.some((field) => field.source === f.field),
  );

export default (fieldMap, options = {}) => {
  const { formSchema = null, includeFields = [], spreadFields = [] } = options;

  if (!formSchema?.fields?.length) {
    return fieldMap;
  }

  const flattenedFormSchema = getFlattenedSchema(formSchema, {
    prefixedLabels: true,
  });

  const decorateWith = flattenedFormSchema.fields
    .filter((f) => {
      if (includeFields.length && isIncluded(fieldMap, includeFields, f)) {
        return true;
      }

      if (spreadFields.length && isIncluded(fieldMap, spreadFields, f)) {
        return true;
      }

      if (includeFields.length) {
        return false;
      }

      return (
        (handledTypes.includes(f.fieldType) || f.options)
        && Object.keys(f.label ?? {}).length
      );
    })
    .map((f) => {
      try {
        return fieldToFlattenerMapItem(f, options);
      } catch (e) {
        throw new VError(e, 'failed to flatten field %s', f.field);
      }
    });

  const decoratedFieldMap = fieldMap
    .map((flatItem) => {
      const match = decorateWith.find(
        ({ source }) => flatItem.source === source,
      );

      if (!match) {
        return flatItem;
      }

      return match;
    })
    .concat(
      ...decorateWith.filter(
        (d) => !fieldMap.find((f) => f.source === d.source),
      ),
    );

  return decoratedFieldMap;
};
