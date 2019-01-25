"use strict";

const schema = require( '@openagenda/validators/schema' );

const _ = {
  extend: require( 'lodash/extend' ),
  keys: require( 'lodash/keys' ),
  isObject: require( 'lodash/isObject' ),
  pick: require( 'lodash/pick' ),
  assign: require( 'lodash/assign' ),
  omit: require( 'lodash/omit' ),
  get: require( 'lodash/get' )
}

schema.register( {
  integer: require( '@openagenda/validators/integer' ),
  boolean: require( '@openagenda/validators/boolean' ),
  choice: require( '@openagenda/validators/choice' ),
  date: require( '@openagenda/validators/date' ),
  text: require( '@openagenda/validators/text' )
} );

let validate, validateData;

module.exports = _.extend( v => {

  if ( !validate ) throw new Error( 'validate not initialized' );

  return validate( _preClean( v ) );

}, {
  init,
  validateData: ( v, options = {} ) => {

    const {
      optionalState
    } = _.assign( { optionalState: false }, options );

    const clean = validateData( _preClean( v ) );

    return  _postClean( v, clean, { optionalState } );

  }
});


function init( { eventStates } ) {

  const fields = {
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
    canEdit: {
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
  }

  validate = schema( fields );

  validateData = schema( _.pick( fields, [ 'state', 'featured', 'userUid' ] ) );

  module.exports.validateData.fields = validateData.fields;

}


function _postClean( v, c, { optionalState } ) {

  if ( !optionalState ) return c;

  if ( _.get( v, 'state', null ) === null ) return _.omit( c, [ 'state' ] );

  return c;

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
