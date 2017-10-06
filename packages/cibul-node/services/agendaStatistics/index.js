"use strict";

const db = require( './lib/db' );
const config = require( '../../config' );
const legacySearch = require( './lib/legacySearch' );
const agendaEventStats = require( './lib/agendaEventStats' );
const queue = require( 'queue' );
const agendaEvents = require( 'agenda-events' );

let q;

module.exports = async agendaUid => {

  const agendaId = await config.knex( 'review' ).first( 'id' ).where( 'uid', agendaUid ).then( result => result.id );

  return {
    db: await db( agendaId ),
    legacySearch: await legacySearch( agendaId ),
    agendaEvents: await agendaEventStats( agendaUid ),
    search: null
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

  agendaEvents.tasks.transferLegacyData( { agendaUid } );

}