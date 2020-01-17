'use strict';

module.exports = (formSchemaField, fieldData) => {
  return [].concat(fieldData || []).reduce((labels, id) => labels.concat(
    formSchemaField.options
      .filter(o => o.id === id)
      .reduce((optionLabels, matchingOption) => optionLabels.concat(
        typeof matchingOption.label === 'string' ? [matchingOption.label] : Object.values(matchingOption.label)
      ), [])
  ), []);
}
