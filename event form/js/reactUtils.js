"use strict";

var cn = require( '../../js/lib/common/common.mod' );

module.exports = {
  createCanvas: createCanvas,
  extend: cn.extend,
  el: cn.el,
  ehUpdate: ehUpdate,
  loadReact: loadReact
}

function loadReact() {

  return window.React;

}

function ehUpdate( eventName ) {

  return function( v ) {

    window.sEventHandler.getInstance().trigger( eventName, v );

  }

}

function createCanvas( parent ) {

  var div = document.createElement( 'div' );

  parent.appendChild( div );

  return div;

}