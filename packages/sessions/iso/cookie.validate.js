"use strict";

const schema = require( 'validators/schema' );
const omit = require( 'lodash/omit' );
const isObject = require( 'lodash/isObject' );
const extend = require( 'lodash/extend' );

schema.register( {
  choice: require( 'validators/choice' ),
  integer: require( 'validators/integer' ),
  text: require( 'validators/text' ),
  link: require( 'validators/link' )
} );

const writableFields = {
  flash: {
    type: 'text',
    max: 1000
  }
}

const fields = {
  user: {
    optional: true,
    fields: {
      culture: {
        type: 'choice',
        optional: false,
        unique: true,
        options: [ 'fr', 'en' ]
      },
      uid: {
        type: 'integer',
        optional: false
      },
      name: {
        type: 'text',
        optional: false
      },
      thumbnail: {
        type: 'link',
        optional: true
      }
    }
  }
};

// jumping through hoops because an empty subobject in schema is processed
// as default: user is not always specified.

const validateWritable = schema( writableFields );

const validateLogged = schema( fields );

const validateUnlogged = schema( omit( fields, [ 'user' ] ) );

module.exports = extend( _validate, {
  validateLogged,
  validateUnlogged,
  writable: validateWritable
} );

function _validate( dirty ) {

  if ( dirty && isObject( dirty ) && !dirty.user ) {

    return validateUnlogged( dirty );

  }

  return validateLogged( dirty );

}