"use strict";

const agendaEvents = require( '@openagenda/agenda-events' );
const formSchemas = require( '@openagenda/form-schemas' );
const queue = require( '@openagenda/queue' );

const agendaEventStats = require( './lib/agendaEventStats' );
const config = require( '../../config' );
const db = require( './lib/db' );
const legacySearch = require( './lib/legacySearch' );
const search = require( '../eventSearch' );
const searchStats = require( './lib/search' );

const log = require( '@openagenda/logs' )( 'services/agendaStatistics' );

let q;

module.exports = async agendaUid => {

  const agenda = await config.knex( 'review' ).first( [ 'id', 'slug', 'form_schema_id' ] ).where( 'uid', agendaUid );

  return {
    db: await db( agenda.id ),
    legacySearch: await legacySearch( agenda.id ),
    agendaEvents: await agendaEventStats( agendaUid ),
    search: await searchStats( agendaUid ),
    hasFormSchema: !!agenda.form_schema_id,
    actions: {
      resyncLegacySearch: `${config.root}/${agenda.slug}/admin/stats/resync/legacySearch`,
      rebuildSearch: `${config.root}/${agenda.slug}/admin/stats/resync/search`,
      resyncAgendaEvents: `${config.root}/${agenda.slug}/admin/stats/resync/agendaEvents`
    }
  }

}

module.exports.init = c => {

  q = queue( 'agendaStatistics', { redis: c.redis } );

}

module.exports.resync = ( agendaUid, type ) => q( { operation: 'resync', agendaUid, type } );

module.exports.transferFormSchema = agenda => {

  log( 'transfering form schema from legacy to form schema db for agenda %d', agenda.uid );
  
  return formSchemas.legacy.transfer( agenda.id );

}

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