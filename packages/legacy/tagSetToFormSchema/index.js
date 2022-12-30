'use strict';

const slug = require('slugify');

const flatten = (label, preferredLang = 'fr') => {
  if (typeof label === 'string') {
    return label;
  }

  return (label ?? {})[preferredLang] ?? label[Object.keys(label).shift()];
};

const isUniqueValuedField = field => ['radio', 'select', 'boolean'].includes(field.fieldType);

const findFieldFromOptionId = (schema, id) => schema.fields
  .reduce((matching, currentField) => {
    if (matching) {
      return matching;
    }
    if (currentField.options.map(o => o.id).includes(id)) {
      return currentField;
    }
    return null;
  }, null);

module.exports = function tagSetToFormSchema(tagSet, options = {}) {
  const {
    lang = 'fr',
    schemaId,
  } = options;
  return {
    fields: tagSet.groups.map(g => ({
      field: slug(flatten(g.name, lang).substr(0, 254), {
        lower: true,
        strict: true,
      }),
      label: g.name,
      fieldType: g.unique ? 'radio' : 'checkbox',
      info: g.info ?? null,
      options: g.tags.map(t => ({
        id: t.id,
        value: slug(flatten(t.label, lang).substr(0, 254), {
          lower: true, strict: true,
        }),
        label: t.label,
      })),
      ...schemaId ? { schemaId } : null,
    })),
  };
};

module.exports.locationAppendAdditionalValues = function locationAppendAdditionalValues(location, formSchema) {
  if (!location.tags) {
    return location;
  }

  return {
    ...location,
    ...location.tags.map(tag => ({
      id: tag.id,
      field: findFieldFromOptionId(formSchema, tag.id),
    })).reduce((additionalFields, { id, field }) => {
      if (!additionalFields[field.field]) {
        additionalFields[field.field] = isUniqueValuedField(field) ? id : [id];
      } else {
        additionalFields[field.field] = [].concat(additionalFields[field.field]).concat(id);
      }
      return additionalFields;
    }, {}),
  };
};
