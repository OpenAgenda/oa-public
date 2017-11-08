"use strict";

var favorites = require( './favorites' ),

debug = require( 'debug' ), log,

params = {
  uid: false // agenda uid required
},

utils = require( '@openagenda/utils' ),

gShare = require( './googleCalendarShare' );

if ( [ 'tpl', 'development' ].indexOf( window.env ) !== -1 ) {

  debug.enable( '*' );

}

window.asap( function( options ) {

  log = debug( 'agendaActions' );

  log( 'initing' );

  utils.extend( params, options );

  favorites.init( { agendaUid: params.uid } );

  favorites.menu();

  gShare( options );

} );