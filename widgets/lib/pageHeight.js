"use strict";

module.exports = {
  check: check,
  setOnChange: setOnChange
}

var height,

cn = require( '../../js/lib/common/common.mod' ),

onChangeCb = false;

cn.addEvent( window, 'resize', check );

function check() {

  var current = _getHeight();

  if ( height == current ) return;

  height = current;

  if ( onChangeCb ) onChangeCb( height );

}

function setOnChange( cb ) {

  onChangeCb = cb;

}

function _getHeight() {
  
  // for IE8, html tag returns wrong height. Taking body height is needed for a cross browser solution.
  return document.getElementsByTagName('body')[0].offsetHeight;

}