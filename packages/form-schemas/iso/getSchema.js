"use strict";

const types = require( './types' );

const schema = require( 'validators/schema' );

const _ = {
  keyBy: require( 'lodash/keyBy' ),
  extend: require( 'lodash/extend' ),
  omit: require( 'lodash/omit' )
}

schema.register( {
  text: require( 'validators/text' ),
  boolean: require( 'validators/boolean' ),
  link: require( 'validators/link' ),
  number: require( 'validators/number' ),
  date: require( 'validators/date' ),
  multilingual: require( 'validators/multilingual' ),
  integer: require( 'validators/number' ), // i need an integer validator
  choice: require( 'validators/choice' )
} );

module.exports = ( fields, accessType = null, accessLevel = null, options = {} ) => {

  const params = _.extend( {
    includeUnspecified: true
  }, options );

  accessLevel = accessLevel === null ? [] : [].concat( accessLevel );

  const validationFields = fields.filter( f => {

    if ( accessType === null ) return true;

    if ( f[ accessType ] === null && params.includeUnspecified ) return true;

    if ( accessLevel.includes( f[ accessType ] ) ) return true;

    return false;

  } ).map( f => {

    let type = types[ f.fieldType ].split( '.' )[ 0 ];

    let validatable = _.extend( f, { type } );

    if ( types[ f.fieldType ].indexOf( 'unique' ) !== -1 ) {

      validatable.unique = true;

    }

    let omits = [ 'label', 'info', 'write', 'read', 'fieldType' ];

    [ 'min', 'max' ].forEach( f => {

      if ( validatable[ f ] === null ) omits.push( f );

    } );

    if ( type === 'choice' ) {

      validatable.options = validatable.options.map( o => o.id );

    }

    return _.omit( validatable, omits );

  } );

  // this guy derives a schema from the fields
  return schema( _.keyBy( validationFields, o => o.field ) );

}