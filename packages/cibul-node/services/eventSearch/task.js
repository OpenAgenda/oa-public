"use strict";

const q = require( '@openagenda/queue' )( 'eventSearch', { redis: require( '../../config' ).redis } );

const agendaIndices = require( './agendaIndices' );

const events = require( './eventTransverseOperations' );

const logger = require( 'logger' );

module.exports = () => {

  let log = logger( 'services/eventSearch/task' );

  q.setConsumer( data => {

    if ( data.args.agendaUid ) {

      return agendaIndices( data.args.agendaUid )[ data.method ]( data.args.eventUid, { refresh: false } );

    } else if ( [ 'update', 'remove', 'add' ].includes( data.method ) ) {

      return events[ data.method ]( data.args.eventUid, { refresh: false } );

    } else {

      return new Promise( ( rs, rj ) => {

        log( 'task not configured: %s', JSON.stringify( data ) );

        rs();

      } );

    }

  } );

  q.launch( { interval: 1000 } );

}