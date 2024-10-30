'use strict';

function flattenLabel(label, lang) {
  if (typeof label === 'string') return label;
  return label[lang] ?? label[Object.keys(label).shift()];
}

function optionToLabel(options, id, lang) {
  return flattenLabel(options.find((v) => v.id === id).label, lang);
}

module.exports = function decorateOptionedFieldsWithLabels(
  event,
  { agenda, lang },
) {
  const additionalFields = agenda.schema.fields
    .filter((v) => !!v.options && v.schemaType !== 'event')
    .reduce((accu, fieldSchema) => {
      if (!event[fieldSchema.field]) return accu;
      accu[fieldSchema.field] = []
        .concat(event[fieldSchema.field])
        .map((id) => ({
          label: optionToLabel(fieldSchema.options, id, lang),
          link: `/?${fieldSchema.field}=${id}`,
          id,
        }));
      return accu;
    }, {});

  return { ...event, ...additionalFields };
};
