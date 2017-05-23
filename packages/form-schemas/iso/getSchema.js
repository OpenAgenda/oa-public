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

module.exports = fields => {

  const validationFields = fields.map( f => {

    let type = types[ f.fieldType ].split( '.' )[ 0 ];

    let validatable = _.extend( f, { type } );

    if ( types[ f.fieldType ].indexOf( 'unique' ) !== -1 ) {

      validatable.unique = true;

    }

    let omits = [ 'label', 'info', 'write', 'read', 'fieldType' ];

    [ 'min', 'max' ].forEach( f => {

      if ( validatable[ f ] === null ) omits.push( f );

    } )

    return _.omit( validatable, omits );

  } );

  // this guy derives a schema from the fields
  return schema( _.keyBy( validationFields, o => o.field ) );

}