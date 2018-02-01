"use strict";

const _ = require( 'lodash' );
const schema = require( '@openagenda/validators/schema' );

schema.register( {
  choice: require( '@openagenda/validators/choice' ),
  integer: require( '@openagenda/validators/integer' ),
  text: require( '@openagenda/validators/text' ),
  link: require( '@openagenda/validators/link' ),
  date: require( '@openagenda/validators/date' ),
  boolean: require( '@openagenda/validators/boolean' )
} );

const writableFields = {
  flash: {
    type: 'text',
    max: 1000
  },
  inbox: {
    lastRequestTime: {
      type: 'integer',
      default: 0
    },
    latestKnownMessageTime: {
      type: 'integer',
      default: 0
    }
  },
  notifications: {
    updatedAt: {
      type: 'date',
      default: null
    },
    count: {
      type: 'integer',
      default: null
    }
  },
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

const validateUnlogged = schema( _.omit( fields, [ 'user' ] ) );

module.exports = _.extend( _validate, {
  validateLogged,
  validateUnlogged,
  writable: validateWritable
} );

function _validate( dirty ) {

  if ( dirty && _.isObject( dirty ) && !dirty.user ) {

    return validateUnlogged( dirty );

  }

  return validateLogged( dirty );

}