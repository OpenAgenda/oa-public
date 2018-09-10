"use strict";

const ih = require( 'immutability-helper' );

const log = require( '@openagenda/logs' )( 'services/agendaContribute/interfaces/setEvent' );

const core = require( '../../../core' );

module.exports = async ( agenda, user, current, data, files ) => {

  log( 'current is %s', current ? 'set' : 'not set' );

  if ( !current ) {

    log( 'creating event' );

    // here the image can be given as a local path for
    // processing by the event service. The event form schema must be accessible
    // on the server side. The event form schema can be made available from the event
    // service. //IAMHERE

    const result = await core.agendas( agenda.uid ).events.create( ih( data, {
      ownerUid: { $set: user.uid },
      creatorUid: { $set: user.uid },
      agendaUid: { $set: agenda.uid }
    } ) );

    return {
      event: result.created.event
    }

  } else {

    log( 'updating event' );

    try {

      const result = await core.agendas( agenda.uid ).events.update( current.uid, data );

      return {
        event: result.updated.event
      }

    } catch ( e ) {

      log( 'error', e.valueOf );

      return {
        event: null
      }

    }

  }

}
