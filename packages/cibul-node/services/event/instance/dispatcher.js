"use strict";

var coms = require( '../../../lib/coms' ),

aggregator,

logger = require( '../../../lib/logger' ),

config = require( '../../../config' );

/**
 * handles callbacks and events when changes occur in event
 */

module.exports = function( loaded, instance ) {

  _requires();

  var log = logger( 'service:event:instance:' + instance.id + ':dispatcher' );

  return {
    stateChange: stateChange,
    onSave: onSave,
    onRemove: onRemove
  }


  function stateChange( oldState, newState ) {

    log( 'stateChange from %s to %s', oldState, newState );

    var agenda = instance.getAgendaContext();

    if ( !agenda ) {

      log( 'stateChange - no agenda context is loaded' );

      return;
    }

    if ( newState == 'published' )  {

      aggregator.notifyPublish( instance.id, instance.agenda.id );

    } else if ( oldState == 'published' ) {

      aggregator.notifyUnpublish( instance.id, instance.agenda.id );

    }

  }


  function onSave() {

    log( 'onSave' );

    coms.publish( config.mainChannel, { name: 'event.update', values: { id: instance.id } } );

  }


  function onRemove() {

    log( 'onRemove' );

    coms.publish( config.mainChannel, { name: 'event.delete', values: { id: instance.id } } );

  }

};

function _requires() {

  // fix for circular reference
 
  if ( !aggregator ) aggregator = require( '../../aggregator' );

}