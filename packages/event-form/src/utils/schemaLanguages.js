"use strict";

const _ = require( 'lodash' );
const ih = require( 'immutability-helper' );
const validator = require( '../validators/languages' );

module.exports = {
  set: setSchemaLanguages,
  getFromSchemaAndValues
}

function getFromSchemaAndValues( schema, interfaceLanguage, valueLanguages = [] ) {

  const validatorOptions = _.first( schema.fields.filter( f => f.field === 'languages' ) ) || {};

  // if no default languages are set, interface language plays that role
  const validate = validator( validatorOptions.default ? validatorOptions
    : _.assign( {}, validatorOptions, { default: [ interfaceLanguage ] } )
  );

  return validate( valueLanguages );

}

function setSchemaLanguages( schema, interfaceLanguage = null, valueLanguages = [] ) {

  const languages = getFromSchemaAndValues( schema, interfaceLanguage, valueLanguages );

  const update = schema.fields.reduce(
    ( update, field, index ) => field.languages ? _.set( update, 'fields.' + index, { languages: { $set: languages } } ) : update
  , {} );

  return ih( schema, update );

}
