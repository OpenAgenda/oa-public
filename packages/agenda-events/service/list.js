"use strict";

const _ = require( 'lodash' );

const VError = require( 'verror' ),

  validate = require( '../iso/validate' );

let config, knex;

module.exports = _.extend( list, { 
  init: ( c, k ) => { config = c; knex = k }
} );

async function list( agendaUid, offset, limit ) {

  if ( !knex ) throw new VError( 'agenda-events service is not configured' );

  return {
    items: ( await _list( agendaUid, offset, limit ) ).map( validate ),
    total: await _total( agendaUid )
  }

}

function _total( agendaUid ) {

  return knex( config.schemas.agendaEvent )

    .where( 'agenda_uid', agendaUid )

    .count( 'id as total' )

    .then( rows => rows[ 0 ][ 'total' ] );

}

function _list( agendaUid, offset, limit ) {

  return knex( config.schemas.agendaEvent )

    .select( [ 'agenda_uid', 'event_uid', 'user_uid', 'state', 'featured', 'legacy_id' ] )

    .where( 'agenda_uid', agendaUid )

    .limit( limit )

    .offset( offset )

  .then( rows => rows.map( r => _.mapKeys( r, ( v, k ) => _.camelCase( k ) ) ) )

}