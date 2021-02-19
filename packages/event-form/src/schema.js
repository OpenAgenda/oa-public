"use strict";

const _ = require('lodash');

const eventValidators = {
  registration: require( './validators/registration' ),
  age: require( './validators/age' ),
  accessibility: require( './validators/accessibility' ),
  keywords: require( './validators/keywords' ),
  timings: require('@openagenda/events/lib/validators/timings'),
  location: require( './validators/location' ),
  languages: require( './validators/languages' ),
  references: require( './validators/references' )
}

const labels = _fillInTheBlanks(require('@openagenda/labels/event/form'));

const merge = require( '@openagenda/form-schemas/client/build/iso/merge' );

const eventReferencesField = require( './fields/references' );

const schemaLanguages = require( './utils/schemaLanguages' );

const eventFields = require('./fields/event');

module.exports = (options = {}) => {
  const {
    mode,
    authorizations,
    interfaceLanguage,
    locationRes,
    mapboxKey,
    referencesRes,
    suggestionsRes,
    languages,
    fileStore,
    schemaExtensions,
    excludeEventFields,
    excludeNonDataFields,
    access
  } = {
    mode: 'create',
    authorizations: {
      canCreateEvent: true,
      canEditEvent: true
    },
    access: {
      read: 'public',
      write: 'public'
    },
    ...options
  };

  const eventSchema = {
    custom: eventValidators,
    fields: []
  }

  const includeEventFields = authorizations[mode === 'create' ? 'canCreateEvent' : 'canEditEvent'];

  if (includeEventFields) {
    eventSchema.fields = eventFields({
      labels,
      mapboxKey,
      locationRes,
      fileStore
    });
  }

  const hasExtensions = Array.isArray(schemaExtensions);

  if (includeEventFields && hasExtensions && _hasReferencesField(schemaExtensions)) {
    eventSchema.fields.push(eventReferencesField({
      res: {
        references: referencesRes,
        suggestions: suggestionsRes
      }
    }));
  }

  // here, for generating the form, provided access as write should suffice
  const finalSchema = merge.apply(null, [eventSchema].concat(hasExtensions ? schemaExtensions : []).concat({ access }));

  if (hasExtensions && excludeEventFields) {
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
