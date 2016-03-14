"use strict";

var imagesLoaded = require( 'imagesloaded' );

module.exports = {
  check: check,
  force: force,
  setOnChange: setOnChange
}

var height,

cn = require( '../../js/lib/common/common.mod' ),



onChangeCb = false,

firstChildPaddings = false,

enabled = true, enableTimeout;

cn.addEvent( window, 'resize', check );

cn.addEvent( window, 'load', function() {

  imagesLoaded( cn.el( 'body' ), check );

});

function check( force ) {

  var current = _getHeight();

  if ( _isDisabled() ) return;

  if ( typeof force !== 'boolean' ) force = false;

  if ( !force && ( height == current ) ) return;

  height = current;

  if ( onChangeCb ) onChangeCb( height );

  _disable();

  _enable( 100 );

}

function force() {

  check( true );

}

function setOnChange( cb ) {

  onChangeCb = cb;

}

function _isDisabled() { 

  return !enabled;

}

function _disable() { 

  enabled = false;

}

function _enable( delay ) { 

  if ( enableTimeout ) clearTimeout( enableTimeout );

  enableTimeout = setTimeout( function() {

    enabled = true;

  }, typeof delay !== 'undefined' ? delay : 0 );

}

function _getHeight() {
  
  // for IE8, html tag returns wrong height. Taking body height is needed for a cross browser solution.
  return document.getElementsByTagName('body')[0].offsetHeight - _getFirstChildPaddingSum();

}

function _getFirstChildPaddingSum() {

  var firstElemIndex = 0, firstChild;

  if ( firstChildPaddings ) return firstChildPaddings[ 0 ] + firstChildPaddings[ 1 ]; // they screw up height estimation

  firstChild = cn.childObject( cn.el( 'body' ), 0 );

  if ( firstChild && ( firstChild.tagName == 'STYLE' ) ) {

    firstChild = cn.childObject( cn.el( 'body' ), 1 );

  }

  if ( !firstChild ) {

    firstChildPaddings = [ 0, 0 ];

  } else {

    firstChildPaddings = [
      _getStyleValue( firstChild, 'paddingTop' ),
      _getStyleValue( firstChild, 'paddingBottom' )
    ];

  }

  return firstChildPaddings[ 0 ] + firstChildPaddings[ 1 ];

}


function _getStyleValue( elem, name ) {

  var style = ( window.getComputedStyle ? window.getComputedStyle( elem ) : elem.currentStyle ) || {};

  return parseInt( style[ name ] || 0, 10 );

}