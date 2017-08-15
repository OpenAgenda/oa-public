"use strict";

const q = require( 'queue' )( 'eventSearch', { redis: require( '../../config' ).redis } );

const agendaIndices = require( './agendaIndices' );

const logger = require( 'logger' );

module.exports = () => {

  let log = logger( 'services/eventSearch/task' );

  q.setConsumer( data => {

    if ( data.method === 'update' ) {

      return agendaIndices( { uid: data.args.agendaUid } ).update( data.args.eventUid, { refresh: false } );

    } else {

      return new Promise( ( rs, rj ) => {

        log( 'task not configured: %s', JSON.stringify( data ) );

        rs();

      } );

    }

  } );

  q.launch( { interval: 1000 } );

}