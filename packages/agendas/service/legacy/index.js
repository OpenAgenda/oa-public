"use strict";

const _ = require( 'lodash' );
const w = require( 'when' );

const utils = require( '@openagenda/utils' );
const log = require( '@openagenda/logs' )( 'legacy' );

const column = require( './column' );
const store = require( './store' );


let schemas, knex;

module.exports = Object.assign( agenda, {
  init: ( s, k ) => {

    schemas = s;
    knex = k;

    column.init( s, k );

  }
} );

function agenda( agendaId ) {

  return {
    applyToLegacy
  }


  /**
   * apply given data to legacy db stores
   */
  function applyToLegacy( data, cb ) {

    w( { agendaId, data, loaded: {} } )

    .then( _updateDefaultState )

    .done( v => cb(), cb );

  }

}

function _updateDefaultState( v ) {

  log( 'updating contribution default state' );

  let defaultState = utils.deep( v.data, 'settings.contribution.defaultState' );

  if ( defaultState === undefined ) return v;

  let d = w.defer();

  store( v.agendaId, 'moderated', defaultState !== 2, err => {

    if ( err ) return d.reject( err );

    d.resolve( v );

  } );

  return d.promise;

}
