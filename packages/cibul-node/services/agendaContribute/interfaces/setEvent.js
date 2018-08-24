"use strict";

const ih = require( 'immutability-helper' );

const log = require( '@openagenda/logs' )( 'services/agendaContribute/interfaces/setEvent' );

const core = require( '../../../core' );

module.exports = async ( agenda, user, current, data ) => {

  log( 'current is %s', current ? 'set' : 'not set' );

  if ( !current ) {

    log( 'creating event' );

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
