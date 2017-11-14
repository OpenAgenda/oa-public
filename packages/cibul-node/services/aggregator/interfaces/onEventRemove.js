"use strict";

const agendaEvents = require( '@openagenda/agenda-events' );

const logger = require( '@openagenda/logger' );

let log;

module.exports = ( eventUid, sourceUid, aggregatorUid ) => {

  agendaEvents( aggregatorUid ).remove( eventUid, {
    context: {
      agendaUid: sourceUid
    }
  } ).catch( e => {

    log( 'error', e );

  } );

}


module.exports.init = () => {

  log = logger( 'services/aggregator/onEventRemove' );

}