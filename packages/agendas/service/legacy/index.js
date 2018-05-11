"use strict";

const w = require( 'when' ),

column = require( './column' ),

store = require( './store' ),

utils = require( '@openagenda/utils' ),

logger = require( '@openagenda/basic-logger' );

let schemas, knex, log = () => {};

module.exports = Object.assign( agenda, { 
  init: ( s, k ) => { 

    schemas = s;
    knex = k;

    column.init( s, k );

    log = logger( 'agendas service.legacy' );

  }
} );

function agenda( agendaId ) {

  return {
    applyToLegacy,
    loadFromLegacy
  }


  /**
   * apply given data to legacy db stores
   */
  function applyToLegacy( data, cb ) {

    w( { agendaId, data, loaded: {} } )

    .then( _updateContributionType )

    .then( _updateDefaultState )

    .then( _updateContributionMessage )

    .then( _updateCredentials )

    .done( v => cb(), cb );

  }


  /**
   * apply current legacy config to agenda model
   */
  function loadFromLegacy( cb ) {

    w( { agendaId, loaded: {
      settings: {
        contribution: {
          moderateOnChangeBy: []
        }
      }
    } } )

    .then( _loadContributionType )

    .then( _loadDefaultState )

    .then( _loadContributionMessage )

    .then( _loadCredentials )

    .done( v => cb( null, v.loaded ), cb );

  }

}


function _updateContributionType( v ) {

  log( 'updating contribution type' );

  let type = utils.deep( v.data, 'settings.contribution.type' );

  if ( type === undefined ) return v;

  let d = w.defer();

  column( v.agendaId, 'contribution_type', type, err => {

    if ( err ) return d.reject( err );

    d.resolve( v );

  } );

  return d.promise;

}


function _updateContributionMessage( v ) {

  log( 'updating contribution message' );

  let message = utils.deep( v.data, 'settings.contribution.message' );

  if ( message === undefined ) {

    message = '';

  }

  let d = w.defer();

  column( v.agendaId, 'contribution_info', message, err => {

    if ( err ) return d.reject( err );

    d.resolve( v );

  } );

  return d.promise;

}


function _loadCredentials( v ) {

  return knex( schemas.legacyCredentialSet )

    .select( '*' )

    .where( { review_id: v.agendaId } )

    .then( rows => {

      if ( !rows.length ) return v;

      let row = rows[ 0 ];

      v.loaded.credentials = {
        indesign: row.indesign,
        activatingInvitations: row.activating_invitations,
        embedsTemplates: row.custom_templates,
        moderators: row.moderator,
        embedsHead: row.custom_head,
        emailstrategie: row.emailstrategie,
        aggregator: row.aggregator,
        tags: row.tags
      };

      return v;

    } );

}


function _updateCredentials( v ) {

  if ( !v.data.credentials ) return v;

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
      emailstrategie: v.data.credentials.emailstrategie,
      tags: v.data.credentials.tags,
      aggregator: v.data.credentials.aggregator
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


function _loadContributionType( v ) {

  let d = w.defer();

  column.get( v.agendaId, 'contribution_type', ( err, value ) => {

    if ( err ) return d.reject( v );

    utils.deep.set( v.loaded, 'settings.contribution.type', value );

    d.resolve( v );

  } );

  return d.promise;

}


function _loadDefaultState( v ) {

  let d = w.defer();

  store.get( v.agendaId, 'moderated', ( err, value ) => {

    if ( err ) return d.reject( v );

    utils.deep.set( v.loaded, 'settings.contribution.defaultState', value ? 0 : 2 );

    d.resolve( v );

  } );

  return d.promise;

}


function _loadContributionMessage( v ) {

  let d = w.defer();

  column.get( v.agendaId, 'contribution_info', ( err, value ) => {

    if ( err ) return d.reject( v );

    utils.deep.set( v.loaded, 'settings.contribution.message', value || null );

    d.resolve( v );

  } );

  return d.promise;

}