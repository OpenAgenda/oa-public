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
    optionnalyByKey: false
  }, options );

  if ( params.allowId && typeof identifiers === 'number' ) {

    return { id: identifiers };

  }

  if ( identifiers.id ) {

    return identifiers;

  }

  const validateSchema = {
    type: {
      type: 'choice',
      optional: false,
      options: keyTypes,
      unique: true
    },
    key: {
      type: 'text',
      optional: !params.requireKey,
      default: params.requireKey ? null : undefined
    }
  };

  if ( !params.optionnalyByKey ) {

    validateSchema.identifier = {
      type: 'number',
      optional: params.optionnalyByKey,
      default: params.optionnalyByKey ? null : undefined
    };

  }

  return schema( validateSchema )( identifiers );

};
