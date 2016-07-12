"use strict";

var aggregator, // loaded through require

controlData,

logger = require( 'logger' ),

async = require( 'async' ),

coms = require( '../../../lib/coms' ),

config = require( '../../../config' ),

clearReferences = require( '../../event/clearReferences' );

module.exports = function( loaded, instance ) {

  _requires();

  var log = logger( 'service:event:instance:' + instance.id + ':dispatcher' );

  return {
    onAddEvent: onAddEvent,
    onRemoveEvent: onRemoveEvent,
    onSave: onSave,
    onRefresh: onRefresh
  }

  function onSave() {

    controlData.queue( instance );

  }

  function onRefresh() {

    controlData.queue( instance );

  }

  function onAddEvent( eventId ) {

    aggregator.notifyPublish( eventId, instance.id );

    coms.publish( config.mainChannel, { 
      name: 'event.update', 
      values: { id: eventId } 
    } );

  }

  function onRemoveEvent( eventId ) {

    aggregator.notifyUnpublish( eventId, instance.id );

    coms.publish( config.mainChannel, { 
      name: 'event.update', 
      values: { id: eventId } 
    } );

    controlData.queue( instance );

    clearReferences( instance.id, eventId );

  }

}


function _requires() { // me no liky circular dependency

  if ( !aggregator ) aggregator = require( '../../aggregator' );

  if ( !controlData ) controlData = require( '../controlData' );

}