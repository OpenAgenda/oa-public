"use strict";

const _ = require( 'lodash' );
const log = require( '@openagenda/logs' )( 'setAll' );

const loadAndSet = require( './set' ).loadAndSet;

module.exports = async ( { knex, queue }, agendaUid ) => {
  queue( 'loop', agendaUid );
}

module.exports.task = async ( { knex, queue } ) => {
  queue.register( {
    loop: loop.bind( null, { knex, queue } ),
    loadAndSet: loadAndSet.bind( null, { knex } )
  } );

  queue.on( 'error', ( fn, args, error ) => {
    log( 'error', fn, args, error );
  } );

  queue.run();
}

async function loop( { knex, queue }, agendaUid ) {

  const agenda = await knex( 'review' )
    .first( [ 'id', 'uid' ] )
    .where( 'uid', agendaUid );

  if ( !agenda ) throw new Error( 'agenda not found' );

  return new Promise( async ( rs, rj ) => {

    const stream = await knex( 'agenda_event' )
      .select( [ 'event_uid as eventUid' ] )
      .where( 'agenda_uid', agendaUid )
      .stream();

    stream.on( 'data', ( { eventUid } ) => {
      queue( 'loadAndSet', agenda.id, eventUid );
    } );

    stream.on( 'error', rj );

    stream.on( 'end', () => rs() );

  } );

}
