'use strict';

module.exports = (formSchema, data) => {
  const taggableFields = formSchema.fields
    .filter(fields=>!!fields.options);
  const taggableFieldNames = taggableFields.map(f => f.field);
  const taggableFieldOptions = taggableFields
    .reduce((options, field) => options.concat(field.options.map(o => ({...o, field: field.field}))), []);

  return Object.keys(data)
    .filter(field => taggableFieldNames.includes(field))
    .reduce((labels, field) => labels.concat(
      [].concat(data[field])
        .map(optionId => taggableFieldOptions.find(option => (option.id === optionId) && (option.field === field)))
        .filter(fieldOption => !!fieldOption)
        .map(fieldOption => fieldOption.label)
        .reduce(_flattenLabels, [])
    ), []);
}

function _flattenLabels(flatLabels, label) {
  return flatLabels.concat(typeof label === 'string' ? label : Object.keys(label).map(l => label[l]));
}
