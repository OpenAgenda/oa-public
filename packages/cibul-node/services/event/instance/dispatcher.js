"use strict";

var coms = require( '../../../lib/coms' ),

aggregator,

controlData = require( '../../agenda/controlData' ),

logger = require( 'logger' ),

config = require( '../../../config' ),

st = {}; // buffer serial saves

/**
 * handles callbacks and events when changes occur in event
 */

module.exports = function( loaded, instance ) {

  _requires();

  var log = logger( 'service:event:instance:dispatcher:' + instance.id );

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

      controlData.queue( instance.agenda );

    } else if ( oldState == 'published' ) {

      aggregator.notifyUnpublish( instance.id, instance.agenda.id );

      controlData.queue( instance.agenda );

    }

  }


  function onSave() {

    if ( st[ instance.id ] ) {

      clearTimeout( st[ instance.id ] );

    }

    st[ instance.id ] = setTimeout( function() {

      log( 'onSave' );

      coms.publish( config.mainChannel, { name: 'event.update', values: { id: instance.id } } );

    }, 200 );

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