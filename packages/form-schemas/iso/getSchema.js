"use strict";

const getValidatorFromField = require( './getValidatorFromField' );

const schema = require( '@openagenda/validators/schema' );

const _ = {
  isObject: require( 'lodash/isObject' ),
  keyBy: require( 'lodash/keyBy' ),
  assign: require( 'lodash/assign' ),
  omit: require( 'lodash/omit' ),
  set: require( 'lodash/set' )
}

schema.register( {
  text: require( '@openagenda/validators/text' ),
  boolean: require( '@openagenda/validators/boolean' ),
  link: require( '@openagenda/validators/link' ),
  number: require( '@openagenda/validators/number' ),
  date: require( '@openagenda/validators/date' ),
  multilingual: require( '@openagenda/validators/multilingual' ),
  integer: require( '@openagenda/validators/integer' ),
  choice: require( '@openagenda/validators/choice' ),
  pass: require( '@openagenda/validators/pass' )
} );

const fileValidator = validatorOptions => schema( {
  extension: {
    type: 'text'
  },
  originalName: {
    type: 'text'
  },
  filename: {
    type: 'text'
  }
} );

schema.register( {
  file: fileValidator
} );

module.exports = ( fields, accessType = null, accessLevel = null, options = {} ) => {

  const params = _.assign( {
    includeUnspecified: true,
    custom: {},
    draft: false
  }, options );

  if ( _.isObject( params.custom ) ) schema.register( params.custom );

  accessLevel = accessLevel === null ? [] : [].concat( accessLevel );

  const schemaConfiguration = fields.filter( f => {

    if ( accessType === null ) return true;

    if ( f[ accessType ] === null && params.includeUnspecified ) return true;

    if ( accessLevel.includes( f[ accessType ] ) ) return true;

    return false;

  } ).map( f => {

    const validatorConfiguration = getValidatorFromField( f, params );

    return validatorConfiguration;

  } ).reduce( ( schemaConfiguration, f ) => _.set( schemaConfiguration, f.field, f ), {} );

  return schema( schemaConfiguration );

}
