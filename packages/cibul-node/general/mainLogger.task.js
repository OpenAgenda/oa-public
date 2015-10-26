/**
 * log main channel stuff
 */

"use strict";

var log = require( 'logger')( 'main' ),

config = require( '../config' ),

coms = require( '../lib/coms' ),

running = false;

module.exports = function() {

  if ( running ) {

    return;

  }

  running = true;

  coms.subscribe( config.mainChannel, function( err, action ) {

    if ( err ) {

      log( 'error', JSON.stringify( err ) );

      return;

    }

    log( 'info', JSON.stringify( action ) );

  } );

}