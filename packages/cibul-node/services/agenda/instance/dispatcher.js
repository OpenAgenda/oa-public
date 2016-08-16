"use strict";

var aggregator, // loaded through require

controlData,

logger = require( 'logger' ), log,

async = require( 'async' ),

coms = require( '../../../lib/coms' ),

config = require( '../../../config' ),

clearReferences = require( '../../event/clearReferences' );

module.exports = function( loaded, instance ) {

  _requires();

  return {
    onAddEvent,
    onRemoveEvent,
    onSave,
    onRefresh
  }

  function onSave() {

    log( 'dispatching on onSave of agenda id %s', instance.id );

    controlData.queue( instance );

  }

  function onRefresh() {

    log( 'dispatching on onRefresh of agenda id %s', instance.id );

    controlData.queue( instance );

  }

  function onAddEvent( eventId ) {

    log( 'dispatching agenda id %s for addEvent of event id %s', instance.id, eventId );

    aggregator.notifyPublish( eventId, instance.id );

    coms.publish( config.mainChannel, { 
      name: 'event.update', 
      values: { id: eventId } 
    } );

  }

  function onRemoveEvent( eventId ) {

    log( 'dispatching agenda id %s for removeEvent of event id %s', instance.id, eventId );

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

  if ( !log ) log = logger( 'services/agenda/instance/dispatcher' );

}