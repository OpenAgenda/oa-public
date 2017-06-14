"use strict";

const schema = require( 'validators/schema' );

const _ = {
  extend: require( 'lodash/extend' ),
  keys: require( 'lodash/keys' )
}

schema.register( {
  integer: require( 'validators/integer' ),
  boolean: require( 'validators/boolean' ),
  choice: require( 'validators/choice' ),
  date: require( 'validators/date' )
} );

let validate;

module.exports = _.extend( v => {

  if ( !validate ) throw new Error( 'validate not initialized' );

  return validate( v );

}, { init } );

function init( { eventStates } ) {

  validate = schema( {
    eventUid: {
      type: 'integer',
      optional: false
    },
    agendaUid: {
      type: 'integer',
      optional: false
    },
    featured: {
      type: 'boolean',
      default: false
    },
    state: {
      type: 'choice',
      default: eventStates.PUBLISHED,
      unique: true,
      optional: false,
      options: _.keys( eventStates ).map( k => eventStates[ k ] )
    },
    createdAt: {
      type: 'date'
    },
    updatedAt: {
      type: 'date'
    }
  } );

}