"use strict";

const _ = require( 'lodash' );

const agendasSvc = require( '@openagenda/agendas' );
const eventsSvc = require( '@openagenda/events' );
const app = require( '../../../app' );

const log = require( '@openagenda/logs' )( 'agendaEvents/fallbackContextGet' );

module.exports = async ( interfaceName, ref, context ) => {

  let event = _.get( context, 'event' );

  let agenda = _.get( context, 'agenda' );

  let user = _.get( context, 'user' );

  if ( !event ) {

    log( 'warn', 'event is missing in context', ref );

    event = await eventsSvc.get( { uid: ref.eventUid }, {
      private: null,
      deleted: null,
      internal: true,
      detailed: true
    } );

    if ( !event ) log( 'error', 'event of uid %s could not be retrieved', _.get( ref, 'uid' ), ref );

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

  if ( !user ) {

    try {

      log( 'warn', 'user is missing in context', ref );

      user = await app.service( '/users' ).findOne( { query: { uid: context.userUid } } );

    } catch ( e ) {

      log( 'error', 'could not load user' );

    }

  } else {

    log( 'user is in context' );

  }

  return { agenda, event, user };

}


