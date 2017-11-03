"use strict";

const db = require( './lib/db' );
const queue = require( 'queue' );
const config = require( '../../config' );
const search = require( '../eventSearch' );
const agendaEvents = require( '@openagenda/agenda-events' );
const legacySearch = require( './lib/legacySearch' );
const searchStats = require( './lib/search' );
const agendaEventStats = require( './lib/agendaEventStats' );
const log = require( '@openagenda/logs' )( 'services/agendaStatistics' );

let q;

module.exports = async agendaUid => {

  const agenda = await config.knex( 'review' ).first( [ 'id', 'slug' ] ).where( 'uid', agendaUid );

  return {
    db: await db( agenda.id ),
    legacySearch: await legacySearch( agenda.id ),
    agendaEvents: await agendaEventStats( agendaUid ),
    search: await searchStats( agendaUid ),
    actions: {
      resyncLegacySearch: `${config.root}/${agenda.slug}/admin/stats/resync/legacySearch`,
      rebuildSearch: `${config.root}/${agenda.slug}/admin/stats/resync/search`,
      resyncAgendaEvents: `${config.root}/${agenda.slug}/admin/stats/resync/agendaEvents`,
    }
  }

}

module.exports.init = c => {

  q = queue( 'agendaStatistics', { redis: c.redis } );

}

module.exports.resync = ( agendaUid, type ) => q( { operation: 'resync', agendaUid, type } );

module.exports.task = () => {

  q.setConsumer( ( data, cb ) => {

    if ( data.operation !== 'resync' ) return cb();


    switch ( data.type ) {

      case 'search': 

        _resyncSearch( data.agendaUid );
        break;

      case 'agendaEvents':

        log( 'resyncing agenda %d - agendaEvents resync', data.agendaUid );
        agendaEvents.tasks.transferLegacyData( { agendaUid: data.agendaUid } );
        break;

      case 'legacySearch':

        _resyncLegacySearch( data.agendaUid );
        break;

    }

    return cb();

  } );

  q.launch();

}

async function _resyncLegacySearch( agendaUid ) {

  log( 'info', 'resyncing agenda %d - legacy search index rebuild', agendaUid );

  const agendaId = await config.knex( 'review' ).first( 'id' ).where( 'uid', agendaUid ).then( result => result.id );

  const result = await legacySearch.resync( agendaId );

  log( 'info', 'agenda %d, resynced legacy search index', agendaId, result );

}

async function _resyncSearch( agendaUid ) {

  log( 'info', 'resyncing agenda %d - new search index rebuild', agendaUid );

  const result = await search.agendas( agendaUid ).rebuild();

  log( 'info', 'agenda %d, resynced search index', agendaUid, result );

}