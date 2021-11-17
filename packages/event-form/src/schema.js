"use strict";

const _ = require('lodash');

const labels = _fillInTheBlanks(require('@openagenda/labels/event/form'));

const merge = require('@openagenda/form-schemas/client/build/iso/merge');

const eventReferencesField = require('./fields/references');

const schemaLanguages = require('./utils/schemaLanguages');

const injectValidators = require('./utils/injectValidators');

const eventFields = require('./fields/event');

module.exports = (options = {}) => {
  const {
    includeEventFields,
    interfaceLanguage,
    referencesRes,
    suggestionsRes,
    languages,
    schemaExtensions,
    excludeNonDataFields,
    access
  } = {
    includeEventFields: true,
    access: {
      read: 'public',
      write: 'public'
    },
    ...options
  };

  const eventSchema = {
    fields: [],
    type: 'event'
  };

  injectValidators(eventSchema);

  eventSchema.fields = eventFields({
    labels
  });

  const hasExtensions = Array.isArray(schemaExtensions);

  if (includeEventFields && hasExtensions && _hasReferencesField(schemaExtensions)) {
    const fieldIndex = eventSchema.fields.map(f => f.field).indexOf('references');
    eventSchema.fields[fieldIndex] = eventReferencesField({
      res: {
        references: referencesRes,
        suggestions: suggestionsRes
      }
    });
  }

  // here, for generating the form, provided access as write should suffice
  const finalSchema = merge.apply(null, [eventSchema].concat(hasExtensions ? schemaExtensions : []).concat({ access }));

  if (hasExtensions && !includeEventFields) {
    const eventSchemaFields = eventSchema.fields.map(f => f.field);
    finalSchema.fields = finalSchema.fields.filter(f => !eventSchemaFields.includes(f.field));
  }

  if (excludeNonDataFields) {
    finalSchema.fields = finalSchema.fields.filter(f => f.field !== 'languages');
  }

  return schemaLanguages.set(finalSchema, interfaceLanguage, languages);
}


function _hasReferencesField( schemaExtensions ) {
  return !!_.flatten(
    schemaExtensions.filter(s => !!s && s.fields).map(s => s.fields)
  ).filter(f => f.field === 'references').length;
}

function _fillInTheBlanks(labels, defaultLang = 'en') {
  Object.keys(labels).forEach(field => {
    Object.keys(labels[field]).forEach(lang => {
      if (!labels[field][lang].length) {
        labels[field][lang] = labels[field][defaultLang];
      }
    });
  });

  return labels;
}

module.exports.eventFields = eventFields;