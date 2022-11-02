"use strict";

const debug = require( 'debug' );

const utils = require( '@openagenda/utils' );

const gShare = require( './googleCalendarShare' );
const spreadsheet = require( './spreadsheet' );

const params = {
  uid: false // agenda uid required
};

let log;

if ( [ 'tpl', 'development' ].indexOf( window.env ) !== -1 ) {

  debug.enable( '*' );

}

window.asap( function( options ) {

  log = debug( 'agendaActions' );

  log( 'initing' );

  utils.extend( params, options );

  gShare( options );

  spreadsheet( options );

} );