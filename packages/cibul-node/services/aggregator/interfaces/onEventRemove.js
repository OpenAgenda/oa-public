"use strict";

const agendaEvents = require( 'agenda-events' );

const logger = require( 'logger' );

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