"use strict";

const schema = require( '@openagenda/validators/schema' );

schema.register( {
  integer: require( '@openagenda/validators/integer' ),
  date: require( '@openagenda/validators/date' ),
  choice: require( '@openagenda/validators/choice' ),
  pass: require( '@openagenda/validators/pass' ),
  boolean: require( '@openagenda/validators/boolean' )
} );

const roles = require( './roles' );

const fields = {
  base: {
    agendaUid: {
      type: 'integer'
    },
    userUid: {
      type: 'integer',
      optional: false
    },
    createdAt: {
      type: 'date'
    },
    updatedAt: {
      type: 'date'
    },
    custom: {
      type: 'pass'
    },
    deletedUser: {
      type: 'boolean',
      default: false
    },
    role: {
      type: 'choice',
      unique: true,
      options: Object.values( roles )
    }
  },
  legacy: {
    userId: {
      type: 'integer'
    },
    agendaId: {
      type: 'integer'
    },
    actionsCounter: {
      type: 'integer'
    },
    credential: {
      type: 'choice',
      unique: true,
      options: Object.values( roles )
    }
  }
}


module.exports = Object.assign( schema( fields.base ), {
  withLegacy: schema( Object.assign( {}, fields.base, fields.legacy ) )
} );
