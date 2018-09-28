"use strict";

const _ = require( 'lodash' );

const schema = require( '@openagenda/validators/schema' );

schema.register( {
  boolean: require( '@openagenda/validators/boolean' )
} );

module.exports = ( values, operation = 'default' ) => {

  const clean = validates[ operation ]( values );

  clean.context.transferToLegacy = clean.transferToLegacy;

  return clean;

}

function validate( values, type = 'base' ) {



}

const base = {
  protected: {
    type: 'boolean',
    default: true
  },
  transferToLegacy: {
    type: 'boolean',
    default: false
  },
  context: {
    optional: true,
    default: null,
    fields: {
      // user at the origin of the operation
      userUid: {
        type: 'integer',
        default: null
      },
      // agenda at the origin of the operation
      agendaUid: {
        type: 'integer',
        default: null
      },
      // if operation was done through legacy app
      legacy: {
        type: 'boolean',
        default: true
      },
      deletion: {
        type: 'boolean',
        optional: true,
        default: false
      }
    }
  }
}

const validates = {
  default: schema( base ),
  create: schema( _.omit( base, [ 'context.fields.deletion' ] ) ),
  update: schema( _.omit( base, [ 'context.fields.deletion' ] ) )
}
