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
      optionalSecondaryFields,
      partial
    } = _.assign( { optionalSecondaryFields: false, partial: false }, options );

    const preCleaned = _preClean( v );

    const validateFn = partial ? validateData.part.bind( null, _pickSetFields( preCleaned ) ) : validateData;

    const clean = validateFn( preCleaned );

    return  _postClean( v, clean, { optionalSecondaryFields } );

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
    sourceAgendaUid: {
      type: 'integer',
      list: true
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

  validateData = schema( _.pick( fields, [ 'state', 'featured', 'userUid', 'sourceAgendaUid' ] ) );

  module.exports.validateData.fields = validateData.fields;

}


function _postClean( v, c, { optionalSecondaryFields } ) {

  if ( !optionalSecondaryFields ) return c;

  const omitted = [];

  if ( _.get( v, 'state', null ) === null ) {
    omitted.push('state');
  }

  if ( _.get( v, 'featured', null ) === null ) {
    omitted.push('featured');
  }

  if ( _.get( v, 'sourceAgendaUid', null ) === null ) {
    omitted.push('sourceAgendaUid');
  }

  return _.omit(c, omitted);
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

function _pickSetFields( preCleaned ) {

  const aeFields = _.keys( validateData.fields );

  return _.keys( preCleaned ).filter( field => aeFields.includes( field ) );

}
