"use strict";

const schema = require( '@openagenda/validators/schema' );
const cookieUserFields = require( '../../iso/cookie.validate' ).validateLogged.fields.user.fields;
const extend = require( 'lodash/extend' );

schema.register( {
  boolean: require( '@openagenda/validators/boolean' ),
  choice: require( '@openagenda/validators/choice' ),
  integer: require( '@openagenda/validators/integer' ),
  email: require( '@openagenda/validators/email' ),
  text: require( '@openagenda/validators/text' ),
  date: require( '@openagenda/validators/date' ),
  link: require( '@openagenda/validators/link' )
} );

module.exports = schema( extend( {
  id: {
    type: 'integer',
    optional: false
  },
  email: {
    type: 'email'
  },
  latestActivity: {
    type: 'date'
  },
  expires: {
    type: 'date'
  },
  isNew: {
    type: 'boolean'
  },
  isBlacklisted: {
    type: 'boolean',
    default: false,
  }
}, cookieUserFields ) );
