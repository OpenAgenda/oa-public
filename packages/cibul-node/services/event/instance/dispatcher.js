"use strict";

const logger = require( '@openagenda/logger' );
const utils = require( '@openagenda/utils' );
const config = require( '../../../config' );
const coms = require( '../../../lib/coms' );
const mailContributor = require( './mailContributor' );

/**
 * handles callbacks and events when changes occur in event
 */

module.exports = function( loaded, instance ) {

  var log = logger( 'services/event/instance/dispatcher' );

  log.load( 'eventId', instance.id );

  return {
    stateChange,
    onSave,
    onRefresh
  }


  function onRefresh() {

    coms.publish( config.mainChannel, {
      name: 'event.update',
      values: {
        id: instance.id,
        type: 'event.refresh'
      }
    } );

  }


  function stateChange( oldState, newState ) {

    log( 'stateChange from %s to %s', oldState, newState );

    var agenda = instance.getAgendaContext();

    if ( !agenda ) {

      log( 'stateChange - no agenda context is loaded' );

      return;
    }

    if ( newState == 'published' )  {

      coms.publish( config.mainChannel, {
        name: 'event.update',
        values: {
          id: instance.id,
          agendaId: agenda.id,
          type: 'event.publish'
        }
      } );

      mailContributor( instance, instance.agenda );

    } else if ( oldState == 'published' ) {

      coms.publish( config.mainChannel, {
        name: 'event.update',
        values: {
          id: instance.id,
          agendaId: agenda.id,
          type: 'event.unpublish'
        }
      } );

    }

  }


  function onSave( options ) {

    log( 'on save happened somehow with these options: %s', JSON.stringify( options ) );

  }

};