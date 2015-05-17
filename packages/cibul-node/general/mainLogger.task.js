/**
 * log main channel stuff
 */

"use strict";

var log = require( '../lib/logger')( 'main' ),

config = require( '../config' ),

coms = require( '../lib/coms' ),

cmn = require( '../lib/commons-task' ),

running = false;

module.exports = {
  load: cmn.makeLoad( run ),
  run: run
}


function run() {

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