"use strict";

const agendaEvents = require( 'agenda-events' );

const remove = require( 'agenda-events/service/remove' );

const coms = require( '../../lib/coms' );

const config = require( '../../config' );

const VError = require( 'verror' );

let log = console.log;

module.exports = {
  //onCreate: () => {},
  //onUpdate: () => {},
  //onRemove: () => {},
  task,
  setLog: l => log = l
}

function task() {

  coms.subscribe( config.mainChannel, async ( err, action ) => {

    if ( err ) return log( 'error', 'coms subscribe error', err );

    log( 'evaluating action %s', action.name );

    let result = null;

    try {

      if ( action.name === 'review.article_create' ) {
        
        result = await agendaEvents.legacyTransfer( action.values.id );

      } else if ( action.name === 'event.update' ) {

        result = await agendaEvents.legacyTransfer( { 
          eventId: action.values.id,
          agendaId: action.values.agendaId || action.values.review_id
        } );

      } else if ( action.name === 'event.remove' ) {

        result = await remove.byLegacyId( null, action.values.id );

      }

      if ( result ) {

        log( 'transfer result: %s', JSON.stringify( result ) );

      }

    } catch ( e ) {

      throw new VError( e, 'legacyTransfer failed for action with values %s', JSON.stringify( action ) );

    }

  } );

}