"use strict";

/**
 * task that looks at event publishings and updates and adds the corresponding jobs
 */

var log = require( '../lib/logger' )( 'oembed task' ),

config = require( '../config' ),

coms = require( '../lib/coms' ),

cmn = require( '../lib/commons-task' ),

oembedSvc = require( '../services/event/' ),

running = false;

module.exports = {
  load: cmn.makeLoad( run );
  run: run
}

function run() {

  if ( running ) {

    return;

  }

  running = true;

  coms.subscribe( config.mainChannel, function( err, action ) {

    if ( err ) return;

    if ( _onStart ) _onStart();

    if ( [ 'event.update', 'event.publish' ].indexOf( action.name ) == -1 ) {

      return;

    }

    oembedSvc.addJob( action.values );

  });

}