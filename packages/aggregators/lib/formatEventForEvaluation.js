'use strict';

const log = require('@openagenda/logs')('aggregators/lib/formatEventForEvaluation');

module.exports = ({ formSchemas }, { event, custom, networkCustom }) => {

  return {
    location: event.location,
    tags: [].concat(
      Object.keys(custom).length ? _extractLabelsOfTaggables(formSchemas.agenda, custom) : []
    ).concat(
      Object.keys(networkCustom).length ? _extractLabelsOfTaggables(formSchemas.network, networkCustom) : []
    )
  }

}

function _extractLabelsOfTaggables(formSchema, data) {
  const taggableFields = formSchema.fields
    .filter(fields=>!!fields.options);
  const taggableFieldNames = taggableFields.map(f => f.field);
  const taggableFieldOptions = taggableFields
    .reduce((options, field) => options.concat(field.options), []);

  return Object.keys(data)
    .filter(field => taggableFieldNames.includes(field))
    .reduce((labels, field) => labels.concat(
      [].concat(data[field])
        .map(optionId => taggableFieldOptions.find(option => option.id === optionId))
        .map(fieldOption => fieldOption.label)
        .reduce(_flattenLabels, [])
    ), []);
}

function _flattenLabels(flatLabels, label) {
  return flatLabels.concat(typeof label === 'string' ? label : Object.keys(label).map(l => label[l]));
}
