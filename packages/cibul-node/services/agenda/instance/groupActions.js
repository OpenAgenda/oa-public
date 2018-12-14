"use strict";

var log = require( '@openagenda/logs' )( 'groupactions - intance' ),

utils = require( '@openagenda/utils' ),

config = require( '../../../config' ),

q = require( '@openagenda/queue' )( config.queues.groupActions, { redis: config.redis } ),

eventSvc = require( '../../event' );

module.exports = require( '../../lib/instanceLoader' )( function( loaded, instance ) {

  return {
    changeEventStates: changeEventStates
  }

  function changeEventStates( oldState, newState, options, cb ) {

    var types = [];

    for ( var t in eventSvc.STATETYPES ) {

      types.push( eventSvc.STATETYPES[ t ] );

    }

    if ( types.indexOf( newState ) == -1 ) {

      return cb( 'state is unknown' );

    }

    q( {
      args: [ instance.id, oldState, newState, options ],
      method: 'dispatchChangeEventStates'
    } );

    cb();

  }

} );
