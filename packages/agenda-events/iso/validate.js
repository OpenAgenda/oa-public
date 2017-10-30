"use strict";

const schema = require( 'validators/schema' );

const _ = {
  extend: require( 'lodash/extend' ),
  keys: require( 'lodash/keys' ),
  isObject: require( 'lodash/isObject' )
}

schema.register( {
  integer: require( 'validators/integer' ),
  boolean: require( 'validators/boolean' ),
  choice: require( 'validators/choice' ),
  date: require( 'validators/date' ),
  text: require( 'validators/text' )
} );

let validate;

module.exports = _.extend( v => {

  if ( !validate ) throw new Error( 'validate not initialized' );

  return validate( _preClean( v ) );

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
    userUid: {
      type: 'integer'
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
    legacyId: {
      type: 'text',
      optional: true
    },
    createdAt: {
      type: 'date'
    },
    updatedAt: {
      type: 'date'
    }
  } );

}


function _preClean( v ) {

  let cleanState;

  if ( !_.isObject( v ) ) return v;

  if ( v.state === undefined ) return v;

  try {

    cleanState = parseInt( v.state );

  } catch ( e ) {

    return v;

  }

  return _.extend( {}, v, {
    state: cleanState
  } )

}