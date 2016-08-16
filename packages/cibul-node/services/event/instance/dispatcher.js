"use strict";

var coms = require( '../../../lib/coms' ),

aggregator,

controlData = require( '../../agenda/controlData' ),

mailContributor = require( './mailContributor' ),

logger = require( 'logger' ),

utils = require( 'utils' ),

config = require( '../../../config' ),

st = {}; // buffer serial saves

/**
 * handles callbacks and events when changes occur in event
 */

module.exports = function( loaded, instance ) {

  _requires();

  var log = logger( 'services/event/instance/dispatcher' );

  log.load( 'eventId', instance.id );

  return {
    stateChange,
    onSave,
    onRemove
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

      mailContributor( instance, instance.agenda );

      // here do something dirty before mailer arrives. get template content, send mail.

    } else if ( oldState == 'published' ) {

      aggregator.notifyUnpublish( instance.id, instance.agenda.id );

      controlData.queue( instance.agenda );

    }

  }


  function onSave( options ) {

    let params = utils.extend( {
      muteAgendas: false
    }, options || {} );

    if ( st[ instance.id ] ) {

      clearTimeout( st[ instance.id ] );

    }

    st[ instance.id ] = setTimeout( () => {

      log( 'onSave for id %s', instance.id );

      coms.publish( config.mainChannel, { name: 'event.update', values: { id: instance.id, muteAgendas: params.muteAgendas } } );

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