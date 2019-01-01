"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );

const controlData = require( '../../agenda/controlData' );
const config = require( '../../../config' );

const log = require( '@openagenda/logs' )( 'agendaEvents/interfaces/queueForControlData' );

module.exports = async ( origin, agenda, event ) => {

  try {

    const legacyEventId = _.get( await config.knex( 'event' ).first( 'id' ).where( 'uid', event.uid ), 'id' );

    if ( !legacyEventId ) {

      throw new VError( 'legacy event id was not retrieved', _.get( event, 'uid' ) );

    }

    controlData.queue( agenda.id, {
      origin,
      type: 'eventUpdate',
      eventId: legacyEventId,
      agenda,
      event
    } );

  } catch ( e ) {

    log( 'error', 'control data update queueing failed', e );

  }

}

module.exports.remove = async ( origin, agenda, event ) => {

  try {

    const legacyEventId = _.get( await config.knex( 'event' ).first( 'id' ).where( 'uid', event.uid ), 'id' );

    if ( !legacyEventId ) {

      throw new VError( 'legacy event id was not retrieved', _.get( event, 'uid' ) );

    }

    controlData.queue( agenda.id, {
      origin,
      type: 'eventRemove',
      eventId: legacyEventId,
      event,
      agenda
    } );

  } catch ( e ) {

    log( 'error', 'control data remove queueing failed', e );

  }

}
