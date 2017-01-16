"use strict";

const schema = require( 'validators/schema' );
const cookieUserFields = require( '../iso/cookie.validate' ).validateLogged.fields.user.fields;
const extend = require( 'lodash/extend' );

schema.register( {
  choice: require( 'validators/choice' ),
  integer: require( 'validators/integer' ),
  email: require( 'validators/email' ),
  text: require( 'validators/text' ),
  date: require( 'validators/date' ),
  link: require( 'validators/link' )
} );

module.exports = schema( extend( {
  code: {
    type: 'text',
    optional: false
  },
  id: {
    type: 'integer',
    optional: false
  },
  email: {
    type: 'email'
  },
  latestActivity: {
    type: 'date'
  }
}, cookieUserFields ) );