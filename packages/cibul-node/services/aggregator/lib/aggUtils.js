"use strict";

var p = require( '../../../lib/promises' ),

agendaSvc, eventSvc;

module.exports = {
  loadAgenda,
  loadEvent
}

function loadEvent( v ) {

  _pre();

  return p.w.promise( function( rs, rj ) {

    eventSvc.get( { id: v.eventId }, function( err, event ) {

      if ( err || !event ) return rj( err || 'no event was found' );

      v.event = event;

      rs( v );

    });

  });

}

function loadAgenda( namespace, identifier ) {

  _pre();

  return function( v ) {

    return p.w.promise( function( rs, rj ) {

      agendaSvc.get( { id: v[ identifier ] }, function( err, agenda ) {

        if ( err || !agenda ) return rj( err || 'no agenda was found' );

        v[ namespace ] = agenda;

        rs( v );

      } );

    });

  }

}

/**
 * prevent circular dependencies error
 */

function _pre() {

  if ( agendaSvc ) return;

  agendaSvc = require( '../../agenda' );

  eventSvc = require( '../../event' );

}