"use strict";

const schema = require( '@openagenda/validators/schema' );
const creds = require( '../credentialTypes' );
const isArray = require( 'lodash/isArray' );
const isObject = require( 'lodash/isObject' );

schema.register( {
  text: require( '@openagenda/validators/text' ),
  choice: require( '@openagenda/validators/choice' ),
  boolean: require( '@openagenda/validators/boolean' ),
  integer: require( '@openagenda/validators/integer' )
} );

module.exports = v => {

  let pre = {};

  if ( isObject( v ) ) {

    Object.keys( v ).forEach( k => {

      if ( k === 'credentials' ) {

        let credFilter = [].concat( v[ k ] );

        if ( credFilter.length && typeof credFilter[ 0 ] === 'string' && credFilter[ 0 ].length > 1 ) {

          pre[ k ] = creds.list( v[ k ] );

          return;

        }

      }

      pre[ k ] = v[ k ];

    } );

  }

  return listQuerySchema( pre );

}

const listQuerySchema = schema( {
  search: {
    type: 'text',
    optional: true,
    max: 255
  },
  invited: {
    type: 'boolean',
    optional: true,
    default: null,
  },
  credentials: {
    type: 'choice',
    optional: true,
    options: creds.types.map( c => c.value )
  },
  id: {
    type: 'integer',
    list: { default: null }
  },
  userId: {
    type: 'integer',
    list: { default: null }
  },
  agendaId: {
    type: 'integer',
    optional: true
  },
  actionsCounterEqualZero: {
    type: 'boolean',
    optional: true,
    default: null
  },
  deletedUser: {
    type: 'boolean',
    optional: true,
    default: null
  },
  order: {
    type: 'choice',
    optional: true,
    options: [ 'credential' ],
    unique: true
  }
} )