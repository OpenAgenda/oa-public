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

module.exports = ( {
  locationRes,
  referencesRes,
  languages: givenLanguages,
  fileStore,
  schemaExtensions,
  excludeEventFields
} ) => {

  const languages = givenLanguages === true
    ? []
    : ( givenLanguages || [] ).filter( l => !!l );

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
      "field" : "languages",
      "fieldType" : "languages",
      "label" : labels.languages
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
      info: labels.timingsInfo
    } ]
  }

  if ( !_.isArray( schemaExtensions ) ) {

    return _setLanguages( eventSchema, languages );

  }

  if ( _hasReferencesField( schemaExtensions ) ) {

    eventSchema.fields.push( eventReferencesField( { res: referencesRes } ) );

  }

  const merged = merge.apply( null, [ eventSchema ].concat( schemaExtensions ) );

  if ( excludeEventFields ) {

    const eventSchemaFields = eventSchema.fields.map( f => f.field );

    merged.fields = merged.fields.filter( f => !eventSchemaFields.includes( f.field ) );

  }

  return _setLanguages( merged, languages );

}

function _setLanguages( schema, languages ) {

  return _.set( schema, 'fields', schema.fields
    .map( field => field.languages ? _.set( field, 'languages', languages ) : field )
  );

}

function _hasReferencesField( schemaExtensions ) {

  return !!_.flatten( schemaExtensions.map( s => s.fields ) )
    .filter( f => f.field === 'references' ).length;

}
