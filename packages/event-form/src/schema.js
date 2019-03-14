"use strict";

const _ = require( 'lodash' );

const eventValidators = {
  registration: require( './validators/registration' ),
  age: require( './validators/age' ),
  accessibility: require( './validators/accessibility' ),
  keywords: require( './validators/keywords' ),
  timings: require( './validators/timings' ),
  location: require( './validators/location' ),
  languages: require( './validators/languages' ),
  references: require( './validators/references' )
}

const labels = require( '@openagenda/labels/event/form' );

const merge = require( '@openagenda/form-schemas/client/build/iso/merge' );

const eventReferencesField = require( './fields/references' );

const schemaLanguages = require( './utils/schemaLanguages' );

module.exports = ( {
  interfaceLanguage,
  locationRes,
  referencesRes,
  suggestionsRes,
  languages,
  fileStore,
  schemaExtensions,
  excludeEventFields
} ) => {

  const eventSchema = {
    custom: eventValidators,
    fields: [ {
      "field" : "image",
      "fieldType" : "image",
      "optional" : true,
      label : labels.image,
      info : labels.imageInfo,
      "extensions" : [ "jpg", "bmp", "png", "jpeg" ],
      "store" : fileStore
    }, {
      "field" : "imageCredits",
      "fieldType" : "text",
      "optional" : true,
      "label" : labels.imageCredits,
      "enableWith" : "image"
    }, {
      field : 'languages',
      fieldType : 'languages',
      label : labels.languages
    }, {
      languages: [],
      "field" : "title",
      "fieldType" : "text",
      "optional" : false,
      "max" : 140,
      "label" : labels.title,
      "placeholder" : labels.titlePlaceholder,
      "sub": labels.titleSub
    }, {
      languages: [],
      "field" : "description",
      "fieldType" : "text",
      "optional" : false,
      "max" : 200,
      "label" : labels.description,
      "placeholder" : labels.descriptionPlaceholder,
      "sub": labels.descriptionSub
    }, {
      languages: [],
      field: 'keywords',
      fieldType: 'keywords',
      optional: true,
      max: 255,
      label: labels.keywords,
      placeholder: labels.keywordsPlaceholder,
      sub: labels.keywordsSub
    }, {
      languages: [],
      "field" : "longDescription",
      "fieldType" : "markdown",
      "label" : labels.longDescription,
      "max" : 10000,
      "sub" : labels.longDescriptionSub,
      "placeholder" : labels.longDescriptionPlaceholder
    }, {
      languages: [],
      "field" : "conditions",
      "fieldType" : "text",
      "label" : labels.conditions,
      "max" : 255,
      "placeholder" : labels.conditionsPlaceholder,
      "sub" : labels.conditionsSub
    }, {
      field: 'age',
      fieldType: 'age',
      optional: true,
      label: labels.age
    }, {
      field: 'registration',
      fieldType: 'registration',
      optional: true,
      label: labels.registration,
      info: labels.registrationInfo,
      placeholder: labels.registrationPlaceholder,
      sub: labels.registrationSub
    }, {
      field: 'accessibility',
      fieldType: 'accessibility',
      optional: true,
      label: labels.accessibility
    }, {
      field: 'location',
      fieldType: 'location',
      optional: false,
      label: labels.location,
      sub: labels.locationSub,
      res: locationRes
    }, {
      field: 'timings',
      fieldType: 'timings',
      optional: false,
      label: labels.timings,
      info: labels.timingsInfo,
      helpLink: 'https://openagenda.zendesk.com/hc/fr/articles/202667461-Saisir-les-horaires-de-votre-%C3%A9v%C3%A9nement'
    } ]
  }

  const hasExtensions = _.isArray( schemaExtensions );

  if ( hasExtensions && _hasReferencesField( schemaExtensions ) ) {

    eventSchema.fields.push( eventReferencesField( {
      res: {
        references: referencesRes,
        suggestions: suggestionsRes
      }
    } ) );

  }

  const finalSchema = hasExtensions ? merge.apply( null, [ eventSchema ].concat( schemaExtensions ) ) : eventSchema;

  if ( hasExtensions && excludeEventFields ) {

    const eventSchemaFields = eventSchema.fields.map( f => f.field );

    finalSchema.fields = finalSchema.fields.filter( f => !eventSchemaFields.includes( f.field ) );

  }

  return schemaLanguages.set( finalSchema, interfaceLanguage, languages );

}


function _hasReferencesField( schemaExtensions ) {

  return !!_.flatten( schemaExtensions.map( s => s.fields ) )
    .filter( f => f.field === 'references' ).length;

}
