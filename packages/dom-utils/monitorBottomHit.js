"use strict";

var onHit = false, monitoredElem,

  du = require( '.' );

if ( typeof document !== 'undefined' ) {

  du.addEvent( document, 'scroll', _monitor );

}

module.exports = function( cb ) {

  monitoredElem = document.getElementsByTagName( 'body' )[ 0 ];

  onHit = cb;

  _monitor();

}

module.exports.assess = _monitor;

function _monitor() {

  if ( !monitoredElem || !onHit ) return;

  var diff = monitoredElem.offsetTop + monitoredElem.offsetHeight
    > Math.ceil( du.getScrollOffsets().y + du.windowInnerHeight() + 1 );

  if ( diff ) return;

  onHit();

}