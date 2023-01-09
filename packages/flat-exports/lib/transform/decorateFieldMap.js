'use strict';

const VError = require('@openagenda/verror');

const fieldToFlattenerMapItem = require('./fieldToFlattenerMapItem');

const handledTypes = ['text', 'integer', 'number', 'email', 'phone', 'link'];

// decorates a ready-to-be used flattener field map
// with the provided form-schemas schema

module.exports = (fieldMap, options = {}) => {
  const {
    formSchema = null,
    includeFields,
  } = options;

  if (!formSchema?.fields?.length) {
    return fieldMap;
  }

  const decorateWith = formSchema.fields
    .filter(f => {
      if (includeFields) {
        return includeFields.some(includeField => (includeField === 'location.tags' && !!f.legacy) || (includeField === f.field
          && !fieldMap.some(field => field.source === f.field)));
      }

      return ((handledTypes.includes(f.fieldType) || f.options) && f.label) || (f.field === 'location' && !!f.legacy);
    })
    .map(f => {
      try {
        return fieldToFlattenerMapItem(f, options);
      } catch (e) {
        throw new VError(e, 'failed to flatten field %s', f.field);
      }
    });

  const decoratedFieldMap = fieldMap.map(flatItem => {
    const match = decorateWith.find(({ source }) => flatItem.source === source);

    if (!match) {
      return flatItem;
    }

    return match;
  }).concat(
    ...decorateWith.filter(d => !fieldMap.find(f => f.source === d.source)),
  );

  return decoratedFieldMap;
};
