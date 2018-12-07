"use strict";

const log = require( '@openagenda/logs' )( 'agendaEvents/interfaces/fallbackContextGet' );

const _ = require( 'lodash' );

module.exports = async ( interfaceName, context ) => {

  let event = _.get( context, 'event' );

  let agenda = _.get( context, 'agenda' );

  if ( !event ) {

    log( 'warn', 'event is missing in context', after );

    event = await eventsSvc.get( { uid: after.eventUid }, { private: null, deleted: null, internal: true } );

  } else {

    log( 'event %s, %s is in context', event.uid, event.slug );

  }

  if ( !agenda ) {

    log( 'warn', 'agenda is missing in context', after );

    agenda = await agendasSvc.get( { uid: after.agendaUid }, {
      internal: true,
      private: null,
      includeImagePath: true
    } );

  } else {

    log( 'agenda %s, %s is in context', agenda.uid, agenda.slug );

  }

  return { agenda, event };

}


