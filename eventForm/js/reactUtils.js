"use strict";

var utils = require( '@openagenda/utils' ),

domUtils = require( '../../js/lib/domUtils' ),

eh = require('../../js/lib/EventHandler/EventHandler.js').sEventHandler.getInstance();

module.exports = {
  createCanvas: createCanvas,
  extend: utils.extend,
  el: domUtils.el,
  ehUpdate: ehUpdate,
  ehSubscriber: ehSubscriber,
  eh: eh
}


function ehUpdate( eventName ) {

  return function( v ) {

    eh.trigger( eventName, v );

  }

}


function ehSubscriber( eventName ) {

  return function( cb ) {

    eh.on( eventName, cb );

  }

}

function createCanvas( parent ) {

  var div = document.createElement( 'div' );

  parent.appendChild( div );

  return div;

}