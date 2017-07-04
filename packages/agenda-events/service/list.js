"use strict";

const _ = require( 'lodash' );

const VError = require( 'verror' ),

  validate = require( '../iso/validate' );

let config, knex;

module.exports = _.extend( list, { 
  init: ( c, k ) => { config = c; knex = k },
  byUserUid: listByUserUid,
  byEventUid: listByEventUid
} );

async function list( agendaUid, offset, limit ) {

  if ( !knex ) throw new VError( 'agenda-events service is not configured' );

  return {
    items: ( await _list( { agendaUid }, offset, limit ) ).map( validate ),
    total: await _total( { agendaUid } )
  }

}

async function listByUserUid( userUid, offset, limit ) {

  if ( !knex ) throw new VError( 'agenda-events service is not configured' );

  return {
    items: ( await _list( { userUid }, offset, limit ) ).map( validate ),
    total: await _total( { userUid } )
  }

}

async function listByEventUid( eventUid, offset, limit ) {

  if ( !knex ) throw new VError( 'agenda-events service is not configured' );

  return {
    items: ( await _list( { eventUid }, offset, limit ) ).map( validate ),
    total: await _total( { eventUid } )
  }

}

function _total( query ) {

  let k = knex( config.schemas.agendaEvent );

  _query( k, query );

  return k.count( 'id as total' )

    .then( rows => rows[ 0 ][ 'total' ] );

}

function _list( query, offset, limit ) {

  let k = knex( config.schemas.agendaEvent )

    .select( [ 'agenda_uid', 'event_uid', 'user_uid', 'state', 'featured', 'legacy_id' ] )

    .limit( limit )

    .offset( offset );

  _query( k, query );

  return k.then( rows => rows.map( r => _.mapKeys( r, ( v, k ) => _.camelCase( k ) ) ) );

}

function _query( k, query ) {

  if ( query.agendaUid !== undefined ) {

    k.where( 'agenda_uid', query.agendaUid );

  } else if ( query.userUid !== undefined ) {

    k.where( 'user_uid', query.userUid );

  } else {

    k.where( 'event_uid', query.eventUid );

  }

}