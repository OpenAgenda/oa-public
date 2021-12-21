'use strict';

/**
 * There is only one mapping per index.
 * Additional fields can only be searchable if their
 * values are added to a mapped ES field.
 */
module.exports = additionalField => {
  if (['email', 'radio', 'select', 'checkbox', 'multiselect'].includes(additionalField.fieldType)) {
    return {
      name: '_search_additional_keywords',
      type: 'keyword'
    }
  }
  return null;
}
