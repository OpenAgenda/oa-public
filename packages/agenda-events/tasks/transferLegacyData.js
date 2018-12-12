"use strict";

const w = require( 'when' );
const _ = require( 'lodash' );
const log = require( '@openagenda/logs' )( 'tasks/transferLegacyData' );
const queue = require( '@openagenda/queue' );
const async = require( 'async' );
const mysql = require( 'mysql' );
const getLegacyState = require( '../service/lib/getLegacyState' );

module.exports = _.extend( run, {
  init: ( c, k, s ) => {

    config = c;
    svc = s;

    q = queue( 'agendaEventTransfer', { redis: config.redis } );

    knex = k;

  }
} );

let config, svc, q, knex;


async function run( options = {} ) {

  const params = _.extend( {
    interval: 500,
    force: false,
    limit: 10,
    total: null,
    queueOnly: false,
    agendaUid: null // focus transfer on one agenda
  }, options );

  if ( !params.queueOnly ) {

    q.setConsumer( _processOperation );

    q.launch( { interval: params.interval } );

  }

  if ( await q.len() ) return;

  let offset = 0, agendaEvents = [],

    legacyQuery = [
      `select a.id as agendaId, e.id as eventId, a.uid as agendaUid, e.uid as eventUid, ra.is_published, ra.state, ra.featured, ra.updated_at as updatedAt, ra.created_at as createdAt, u.uid as userUid`,
      `from ${config.legacy.schemas.agendaEvent} as ra`,
      `left join ${config.legacy.schemas.agenda} as a on a.id=ra.review_id`,
      `left join ${config.legacy.schemas.event} as e on e.id=ra.event_id`,
      `left join ${config.legacy.schemas.user} as u on u.id=ra.user_id`
    ];

  if ( params.agendaUid ) {

    legacyQuery.push( `where a.uid = ${params.agendaUid}` );

  }

  legacyQuery.push( 'limit ?, ?' );


  // queue transfers to do

  while ( ( agendaEvents = ( await _query( legacyQuery.join( ' ' ), [ offset, params.limit ] ) ) ).length ) {

      if ( !( offset % 100 ) ) {

        log( 'info', 'evaluated %s agenda event references', offset );

      }

      agendaEvents.forEach( ae => {

        q( {
          operation: 'transfer',
          legacy: ae,
          force: params.force
        } );

      } );

      offset += params.limit;

      if ( params.total !== null && offset >= params.total ) {

        break;

      }

      await _sleep( params.interval );

  }

  // queue deletes to do

  offset = 0;

  legacyQuery = [
    `select agenda_uid, event_uid from ${config.schemas.agendaEvent}`
  ];

  if ( params.agendaUid ) {

    legacyQuery.push( `where agenda_uid = ${params.agendaUid}` );

  }

  legacyQuery.push( 'limit ?, ?' );

  while ( ( agendaEvents = ( await _query( legacyQuery.join( ' ' ), [ offset, params.limit ] ) ) ).length ) {

    let refs = agendaEvents.map( r => ( { agendaUid: r.agenda_uid, eventUid: r.event_uid } ) );

    offset += params.limit;

    let ref;

    while ( ref = refs.pop() ) {

      if ( !( await _query( `select ae.id from ${config.legacy.schemas.agendaEvent} as ae
        left join ${config.legacy.schemas.event} as e on e.id=ae.event_id
        left join ${config.legacy.schemas.agenda} as a on a.id=ae.review_id
        where a.uid = ? and e.uid = ?`, [ ref.agendaUid, ref.eventUid ] ) ).length ) {

        q( {
          operation: 'delete',
          agendaEvent: ref
        } );

      }

    }

    await _sleep( params.interval );

  }

}

function _query( query, values = [] ) {

  return knex.raw( query, values ).then( result => result[ 0 ] );

}



function _processOperation( data, cb ) {

  if ( data.operation === 'transfer' ) {

    let operation = null;

    let ae = data.legacy;

    svc( ae.agendaUid ).get( ae.eventUid ).then( ref => {

      if ( ref === null ) {

        operation = 'create';

        return svc( ae.agendaUid ).create( ae.eventUid, {
          featured: ae.featured,
          state: getLegacyState( ae.state, ae.is_published ),
          legacyId: ae.agendaId + '.' + ae.eventId,
          userUid: ae.userUid,
          createdAt: ae.createdAt,
          updatedAt: ae.updatedAt
        }, { protected: false } );

      } else if ( ref.updatedAt.getTime() === ( new Date( ae.updatedAt ) ).getTime() ) {

        operation = 'ignored.sameUpdatedAt';

      } else {

        operation = 'update';

        return svc( ae.agendaUid ).update( ae.eventUid, {
          featured: ae.featured,
          state: getLegacyState( ae.state, ae.is_published ),
          legacyId: ae.agendaId + '.' + ae.eventId,
          createdAt: ae.createdAt,
          updatedAt: ae.updatedAt
        }, { protected: false } );

      }

    } )

    .catch( err => {

      log( 'error', 'agenda/event ref %s errored: %s', ae.agendaUid + '/' + ae.eventUid, err );

      cb();

    } )

    .then( result => {

      if ( operation === 'create' ) {

        log( 'info', 'agenda/event ref %s created', ae.agendaUid + '/' + ae.eventUid );

      } else if ( operation === 'update' ) {

        log( 'info', 'agenda/event ref %s updated', ae.agendaUid + '/' + ae.eventUid );

      } else if ( operation === 'ignored.sameUpdatedAt' ) {

        log( 'info', 'agenda/event ref %s ignored: same updatedAt', ae.agendaUid + '/' + ae.eventUid );

      } else {

        log( 'error', 'agenda/event ref %s errored: %s', ae.agendaUid + '/' + ae.eventUid, JSON.stringify( result ) );

      }

      cb();

    } );

  } else if ( data.operation === 'delete' ) {

    svc( data.agendaEvent.agendaUid ).remove( data.agendaEvent.eventUid )

    .catch( err => {

      log( 'error', 'could not remove agendaEvent of refs %s/%s: %s', data.agendaEvent.agendaUid, data.agendaEvent.eventUid, err );

      cb();

    } )

    .then( result => {

      if ( !result.success ) {

        log( 'error', 'removal of agendaEvent %s/%s was not successful', data.agendaEvent.agendaUid, data.agendaEvent.eventUid );

      } else {

        log( 'info', 'removed agendadEvent %s/%s', data.agendaEvent.agendaUid, data.agendaEvent.eventUid );

      }

      cb();

    } );

  }

}


function _sleep( ms ) {

  return new Promise( rs => setTimeout( rs, ms ) );

}
