"use strict";

var coms = require( '../../../lib/coms' ),

mailContributor = require( './mailContributor' ),

logger = require( 'logger' ),

utils = require( 'utils' ),

config = require( '../../../config' ),

st = {}; // buffer serial saves

/**
 * handles callbacks and events when changes occur in event
 */

module.exports = function( loaded, instance ) {

  var log = logger( 'services/event/instance/dispatcher' );

  log.load( 'eventId', instance.id );

  return {
    stateChange,
    onSave,
    onRemove,
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


  function onRemove() {

    log( 'onRemove' );

    coms.publish( config.mainChannel, { name: 'event.delete', values: { id: instance.id } } );

  }

};