"use strict";

const _ = require( 'lodash' );
const queue = require( '@openagenda/queue' );
const logger = require( '@openagenda/logs' );

let service, config, log, q;

module.exports = _.extend( run, { init: ( svc, c ) => {

  service = svc;

  config = c;

  q = queue( 'eventTransfer', { redis: config.redis } );

  log = logger( 'events service/tasks/slowTransfer' );

} } );


async function run( options = {} ) {

  const params = _.extend( {
    interval: 500,
    force: false,
    limit: 100
  }, options );

  let knex = service.getConfig().knex;

  q.setConsumer( _processOperation );

  q.launch( { interval: params.interval } );

  if ( await q.len() ) return;

  // queue transfer tasks
  
  let offset = 0, events = [];

  while ( ( events = ( await knex.raw( `select id, uid, updated_at from ${config.legacy.schemas.event} limit ?, ?`, [ offset, params.limit ] ) )[ 0 ] ).length ) {

    let legacyEventUids = events.map( e => e.uid );

    let newEvents = ( await knex.raw( `select uid, updated_at from ${config.schemas.event} where uid in (${legacyEventUids.join( ', ' )})` ) )[ 0 ];

    legacyEventUids.forEach( ( uid, i ) => {

      let matches = newEvents.filter( e => e.uid === uid );

      if (  
        params.force // forcing transfer
        || !matches // no event was found in new store
        || ( matches[ 0 ].updated_at.getTime() !== events[ i ].updated_at.getTime() ) // timestamps are different
      ) {

        log( 'queueing event of id %s for transfer', events[ i ].id );

        q( {
          operation: 'transfer', 
          id: events[ i ].id,
          force: params.force
        } );

      }

    } );

    offset+=params.limit;

    await _sleep( params.interval );

  }

  // delete events of new store that are no longer in legacy store

  offset = 0;

  events = [];

  while( ( events = ( await knex.raw( `select uid from ${config.schemas.event} limit ?, ?`, [ offset, params.limit ] ) )[ 0 ] ).length ) {

    let legacyEventUids = ( await knex.raw( `select uid from ${config.legacy.schemas.event} where uid in (${events.map( e => e.uid ).join( ', ' )})` ) )[ 0 ].map( e => e.uid );

    events.map( e => e.uid ).filter( uid => !legacyEventUids.includes( uid ) ).forEach( uid => {

      log( 'queuing event of uid %s for deletion from new store', uid );

      q( {
        operation: 'delete',
        uid
      } );

    } );

    offset+=params.limit;

    await _sleep( params.interval );

  }

}


function _processOperation( data, cb ) {

  if ( data.operation === 'transfer' ) {

    service.legacy.transfer( data.id, { force: data.force }, ( err, r ) => {

      if ( err ) {

        log( 'error', 'transferring event error: %s, error: %s', data.id, err );

      } else {

        log( 'info', 'transfer success: %s > %s', data.id, r.success ? 'success' : 'failed' );

      }

      cb();

    } );

  } else if ( data.operation === 'delete' ) {

    let knex = service.getConfig().knex;

    knex.raw( `delete from ${config.schemas.event} where uid = ?`, data.uid )

      .catch( e => {

        log( 'error', 'failed to remove event %s: %s', data.uid, err );

        cb();

      } )

      .then( result => {

        log( 'info', 'removed event %s from new event schema', data.uid );

        cb();

      } );

  }

}


function _sleep( ms = 0 ) {

  return new Promise( rs => setTimeout( rs, ms ) );

}