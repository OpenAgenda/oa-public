"use strict";

/**
 * task that looks at event publishings and updates and adds the corresponding jobs
 */

var config = require( '../config' ),

coms = require( '../lib/coms' ),

oembedSvc = require( '../services/event/oembed' ),

running = false,

_onStart,

_onComplete;

module.exports = run;

// for testing
module.exports.setOnStart = setOnStart,
module.exports.setOnComplete = setOnComplete,
module.exports.setComs = setComs

function run() {

  if ( running ) {

    return;

  }

  running = true;

  coms.subscribe( config.mainChannel, function( err, action ) {

    if ( err ) return;

    if ( _onStart ) _onStart();

    if ( [ 'event.update', 'event.publish', 'event.create' ].indexOf( action.name ) == -1 ) {

      return;

    }

    oembedSvc.addJob( action.values.id , function() {

      if ( _onComplete ) _onComplete();

    } );

  });

}


function setOnStart( cb ) {

  _onStart = cb;

}


function setOnComplete( cb ) {

  _onComplete = cb;

}


function setComs( c ) {

  coms = c;

  oembedSvc.setComs( c );

}