const { produce } = require('immer');

const eventFormLabels = require('@openagenda/labels/event/form');

const merge = require('@openagenda/form-schemas/client/build/iso/merge');

const schemaLanguages = require('./utils/schemaLanguages');

const injectValidators = require('./utils/injectValidators');

const eventFields = require('./fields/event');

function _fillInTheBlanks(labels, defaultLang = 'en') {
  return produce(labels, (draft) => {
    Object.keys(draft).forEach((field) => {
      Object.keys(draft[field]).forEach((lang) => {
        if (!draft[field][lang].length) {
          draft[field][lang] = draft[field][defaultLang];
        }
      });
    });
    return draft;
  });
}

const labels = _fillInTheBlanks(eventFormLabels);

module.exports = (options = {}) => {
  const {
    includeEventFields,
    interfaceLanguage,
    languages,
    schemaExtensions,
    excludeNonDataFields,
    access,
  } = {
    includeEventFields: true,
    access: {
      read: 'public',
      write: 'public',
    },
    ...options,
  };

  const eventSchema = {
    fields: [],
    type: 'event',
  };

  injectValidators(eventSchema);

  eventSchema.fields = eventFields({
    labels,
  });

  const hasExtensions = Array.isArray(schemaExtensions);

  // here, for generating the form, provided access as write should suffice
  const finalSchema = merge(
    ...[eventSchema]
      .concat(hasExtensions ? schemaExtensions : [])
      .concat({ access }),
  );

  if (hasExtensions && !includeEventFields) {
    const eventSchemaFields = eventSchema.fields.map((f) => f.field);
    finalSchema.fields = finalSchema.fields.filter(
      (f) => !eventSchemaFields.includes(f.field),
    );
  }

  if (excludeNonDataFields) {
    finalSchema.fields = finalSchema.fields.filter(
      (f) => f.field !== 'languages',
    );
  }

  return schemaLanguages.set(finalSchema, interfaceLanguage, languages);
};

module.exports.eventFields = eventFields;
