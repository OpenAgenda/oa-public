"use strict";

module.exports = {
  check: check,
  force: force,
  setOnChange: setOnChange
}

var height,

cn = require( '../../js/lib/common/common.mod' ),

onChangeCb = false;

cn.addEvent( window, 'resize', check );

function check( force ) {

  var current = _getHeight();

  if ( typeof force == 'undefined' ) force = false;

  if ( !force && ( height == current ) ) return;

  height = current;

  if ( onChangeCb ) onChangeCb( height );

}

function force() {

  check( true );

}

function setOnChange( cb ) {

  onChangeCb = cb;

}

function _getHeight() {
  
  // for IE8, html tag returns wrong height. Taking body height is needed for a cross browser solution.
  return document.getElementsByTagName('body')[0].offsetHeight;

}