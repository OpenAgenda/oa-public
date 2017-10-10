"use strict";

const db = require( './lib/db' );
const queue = require( 'queue' );
const config = require( '../../config' );
const search = require( '../eventSearch' );
const agendaEvents = require( 'agenda-events' );
const legacySearch = require( './lib/legacySearch' );
const searchStats = require( './lib/search' );
const agendaEventStats = require( './lib/agendaEventStats' );
const log = require( 'logs' )( 'services/agendaStatistics' );

let q;

module.exports = async agendaUid => {

  const agendaId = await config.knex( 'review' ).first( 'id' ).where( 'uid', agendaUid ).then( result => result.id );

  return {
    db: await db( agendaId ),
    legacySearch: await legacySearch( agendaId ),
    agendaEvents: await agendaEventStats( agendaUid ),
    search: await searchStats( agendaUid )
  }

}

module.exports.init = c => {

  q = queue( 'agendaStatistics', { redis: c.redis } );

}

module.exports.resync = agendaUid => q( { operation: 'resync', agendaUid } );

module.exports.task = () => {

  q.setConsumer( ( data, cb ) => {

    if ( data.operation === 'resync' ) {

      _resync( data.agendaUid );

    }

    return cb();

  } );

  q.launch();

}

function _resync( agendaUid ) {

  log( 'resyncing agenda %d - new search index rebuild', agendaUid );

  search.agendas( agendaUid ).rebuild().then( r =>  {

    log( 'info', 'agenda %d, resynced search index', agendaUid, r );

    log( 'resyncing agenda %d - agendaEvents resync', agendaUid );

    //agendaEvents.tasks.transferLegacyData( { agendaUid } );    

  } );

}