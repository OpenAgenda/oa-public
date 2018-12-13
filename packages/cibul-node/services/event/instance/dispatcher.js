"use strict";

const _ = require( 'lodash' );

const log = require( '@openagenda/logs' )( 'services/event/instance/dispatcher' )
const config = require( '../../../config' );
const coms = require( '../../../lib/coms' );

/**
 * handles callbacks and events when changes occur in event
 */

module.exports = function( loaded, instance ) {

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


  function stateChange( oldState, newState, user ) {

    log( 'stateChange from %s to %s', oldState, newState );

    var agenda = instance.getAgendaContext();

    if ( !agenda ) {

      log( 'stateChange - no agenda context is loaded' );

      return;
    }

    const values = {
      user_uid : _.get( user, 'uid' ),
      id: instance.id,
      agendaId: agenda.id
    };

    if ( newState == 'published' )  {

      coms.publish( config.mainChannel, {
        name: 'event.update',
        values: _.set( values, 'type', 'event.publish' )
      } );

    } else if ( oldState == 'published' ) {

      coms.publish( config.mainChannel, {
        name: 'event.update',
        values: _.set( values, 'type', 'event.unpublish' )
      } );

    } else {

      coms.publish( config.mainChannel, {
        name: 'event.update',
        values: _.set( values, 'type', 'event.' + newState )
      } );

    }

  }


  function onSave( options ) {

    log( 'on save happened somehow with these options: %s', JSON.stringify( options ) );

  }

};
