'use strict';

const VError = require('@openagenda/verror');

const fieldToFlattenerMapItem = require('./fieldToFlattenerMapItem');

const handledTypes = ['text'];

// decorates a ready-to-be used flattener field map
// with the provided form-schemas schema

module.exports = (fieldMap, options = {}) => {
  const {
    formSchema = null,
    includeFields
  } = options;

  if (!formSchema?.fields?.length) {
    return fieldMap;
  }

  const decorateWith = formSchema.fields
    .filter(f => {
      if (includeFields && !includeFields.includes(f.field)) {
        return false;
      }

      return (handledTypes.includes(f.fieldType) || f.options) && f.label;
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
    decorateWith.filter(d => !fieldMap.find(f => f.source === d.source))
  );

  return decoratedFieldMap;
};
