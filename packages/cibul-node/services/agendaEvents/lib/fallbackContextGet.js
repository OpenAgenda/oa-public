"use strict";

const log = require( '@openagenda/logs' )( 'agendaEvents/interfaces/fallbackContextGet' );

const _ = require( 'lodash' );

module.exports = async ( interfaceName, ref, context ) => {

  let event = _.get( context, 'event' );

  let agenda = _.get( context, 'agenda' );

  if ( !event ) {

    log( 'warn', 'event is missing in context', ref );

    event = await eventsSvc.get( { uid: ref.eventUid }, { private: null, deleted: null, internal: true } );

  } else {

    log( 'event %s, %s is in context', event.uid, event.slug );

  }

  if ( !agenda ) {

    log( 'warn', 'agenda is missing in context', ref );

    agenda = await agendasSvc.get( { uid: ref.agendaUid }, {
      internal: true,
      private: null,
      includeImagePath: true
    } );

  } else {

    log( 'agenda %s, %s is in context', agenda.uid, agenda.slug );

  }

  return { agenda, event };

}


