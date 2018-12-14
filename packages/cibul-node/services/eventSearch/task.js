"use strict";

const q = require( '@openagenda/queue' )( 'eventSearch', { redis: require( '../../config' ).redis } );

const agendaIndices = require( './agendaIndices' );

const agendaEvents = require( '@openagenda/agenda-events' );

const events = require( './eventTransverseOperations' );

const logs = require( '@openagenda/logs' )( 'services/eventSearch/task' );

module.exports = () => {

  q.setConsumer( async data => {

    if ( data.args.agendaUid ) {

      const ae = await agendaEvents( data.args.agendaUid ).get( data.args.eventUid );

      return agendaIndices( data.args.agendaUid )[ data.method ]( ae, { refresh: false } );

    } else if ( [ 'update', 'remove', 'add' ].includes( data.method ) ) {

      return await events[ data.method ]( data.args.eventUid, { refresh: false } );

    } else {

      return new Promise( ( rs, rj ) => {

        log( 'task not configured: %s', JSON.stringify( data ) );

        rs();

      } );

    }

  } );

  q.launch( { interval: 1000 } );

}
