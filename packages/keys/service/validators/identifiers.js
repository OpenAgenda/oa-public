"use strict";

const schema = require( 'validators/schema' );
const keyTypes = require( '../lib/keyTypes' );

schema.register( {
  choice: require( 'validators/choice' ),
  text: require( 'validators/text' ),
  number: require( 'validators/number' )
} );

module.exports = ( identifiers, options ) => {

  const params = Object.assign( {
    allowId: true,
    requireKey: false,
    keyOrIdentifier: false
  }, options );

  if ( params.allowId && typeof identifiers === 'number' ) {

    return { id: identifiers };

  }

  if ( identifiers.id ) {

    return identifiers;

  }

  // type (required) + identifier (required)
  // type (required) + identifier (required) + key (required)
  // type (required) + key (required)
  // type (required) + key + identifier (at least one)
  // already as string

  const validateSchema = {
    type: {
      type: 'choice',
      optional: false,
      options: keyTypes,
      unique: true
    }
  };

  if ( params.keyOrIdentifier ) {

    if ( typeof identifiers.key === 'undefined' && typeof identifiers.identifier === 'undefined' ) {

      throw {
        code: 'required',
        field: 'key',
        message: 'a key or an identifier is required',
        origin: undefined
      };

    }

    if ( typeof identifiers.key !== 'undefined' ) {

      validateSchema.key = {
        type: 'text',
        optional: false
      };

      if ( !validateSchema.identifier ) validateSchema.identifier = {
        type: 'text',
        optional: true,
        default: undefined
      };

    }

    if ( typeof identifiers.identifier !== 'undefined' ) {

      validateSchema.identifier = {
        type: 'text',
        optional: false
      };

      validateSchema.key = {
        type: 'text',
        optional: true,
        default: undefined
      };

    }

  } else {

    validateSchema.identifier = {
      type: 'number',
      optional: false
    };

  }

  if ( params.requireKey ) {

    validateSchema.key = {
      type: 'text',
      optional: false
    };

  }

  return schema( validateSchema )( identifiers );

};
