"use strict";

var cn = require( '../../js/lib/common' ),

debug = require( 'debug' ), log,

enabled = false,

onBottomHit = false,

monitoredElem = false;

module.exports = {
  enable: enable,
  disable: disable
};

function enable( elem, cb ) {

  if ( enabled ) disable();

  log = debug( 'bottomHit' );

  monitoredElem = elem;

  cn.addEvent( document, 'scroll', _monitor );

  enabled = true;

  onBottomHit = cb;

}

function disable() {

  cn.removeEvent( document, 'scroll', _monitor );

  enabled = false;

  onBottomHit = false;

}


function _monitor() {

  var pos;

  if ( !enabled ) {

    return log( 'not enabled' );

  }

  if ( !monitoredElem ) {

    return log( 'no element to monitor' );

  }

  if ( !onBottomHit ) {

    return log( 'no callback set' );

  }

  if ( 
    monitoredElem.offsetTop + monitoredElem.offsetHeight 
    <= cn.getScrollOffsets().y + cn.windowInnerHeight()
  ) {

    onBottomHit();

  }

}
