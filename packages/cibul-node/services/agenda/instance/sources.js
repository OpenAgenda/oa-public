"use strict";

var log = require( '@openagenda/logs' )( 'agenda sources' ),

util = require( 'util' ),

aggregator = require( '../../aggregators' );

module.exports = require( '../../lib/instanceLoader' )( function( loaded, instance ) {

  return {
    add,
    remove
  }

  function add( sourceAgenda, cb ) {

    var upcomingOnly = false;

    aggregator.sourceAdd( sourceAgenda.id, instance.id, upcomingOnly, cb );

  }

  function remove( sourceAgenda, cb ) {

    aggregator.sourceRemove( sourceAgenda.id, instance.id, cb );

  }

} );
