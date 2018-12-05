"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );

const controlData = require( '../agenda/controlData' );

const log = require( '@openagenda/logs' )( 'agendaEvents/interfaces/queueForControlData' );

module.exports = ( origin, legacy, context ) => {

  try {

    const contextAvailable = _.get( context, 'agenda' ) && _.get( context, 'event' );

    log( 'updating with %s', contextAvailable ? 'context' : 'legacy', contextAvailable ? context : legacy );

    const base = {
      origin,
      type: 'eventUpdate',
      eventId: _.get( contextAvailable ? context : legacy, 'event.id' ),
      info: contextAvailable ? 'context refs are available' : 'context refs are not available'
    };

    if ( contextAvailable ) {

      controlData.queue( context.agenda.id, _.assign( base, _.pick( context, [ 'agenda', 'event' ] ) ) );

    } else if ( legacy.agenda && legacy.event ) {

      controlData.queue( legacy.agenda.id, base );

    }

  } catch ( e ) {

    log( 'error', 'control data update queueing failed', e );

  }

}

module.exports.remove = ( origin, legacy, context ) => {

  try {

    const contextAvailable = _.get( context, 'agenda' ) && _.get( context, 'event' );

    log( 'removing with %s', contextAvailable ? 'context' : 'legacy', contextAvailable ? context : legacy );

    const eventId = _.get( contextAvailable ? context : legacy, 'event.id' );
    const agendaId = _.get( contextAvailable ? context : legacy, 'agenda.id' );

    controlData.queue( agendaId, _.assign( {
      origin,
      type: 'eventRemove',
      eventId
    }, context ) );

  } catch ( e ) {

    log( 'error', 'control data remove queueing failed', e );

  }

}
