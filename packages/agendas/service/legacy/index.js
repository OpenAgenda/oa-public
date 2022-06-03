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

    .then( _updateCredentials )

    .done( v => cb(), cb );

  }

}


function _updateCredentials( v ) {

  if (!v.data.credentials || !schemas.legacyCredentialSet) return v;

  log( 'updating credentials' );

  return w( {
    agendaId: v.agendaId,
    insert: false,
    values: {
      indesign: v.data.credentials.indesign,
      activating_invitations: v.data.credentials.activatingInvitations,
      custom_templates: v.data.credentials.embedsTemplates,
      moderator: v.data.credentials.moderators,
      custom_head: v.data.credentials.embedsHead,
      tags: v.data.credentials.tags,
      aggregator: v.data.credentials.aggregator,
      event_transfer: v.data.credentials.eventOwnershipTransfer
    }
  } )

  .then( vv => {

    return knex( schemas.legacyCredentialSet )

    .select( 'id' )

    .where( { review_id: vv.agendaId } )

    .then( rows => {

      vv.insert = rows.length ? false : true;

      return vv;

    } );

  } )

  // update
  .then( vv => {

    if ( vv.insert ) return vv;

    return knex( schemas.legacyCredentialSet )

    .where( { review_id: vv.agendaId } )

    .update( Object.assign( {
      updated_at: new Date()
    }, vv.values ) )

    .then( () => vv );

  } )

  // insert
  .then( vv => {

    if ( !vv.insert ) return vv;

    return knex( schemas.legacyCredentialSet )

    .insert( Object.assign( {
      updated_at: new Date(),
      created_at: new Date(),
      review_id: vv.agendaId
    }, vv.values ) )

    .then( () => vv );

  } )

  .then( vv => v );

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
