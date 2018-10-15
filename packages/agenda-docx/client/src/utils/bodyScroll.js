"use strict";

const du = require( './dom' );

module.exports = {
  enable,
  disable
}

// remove overflow:hidden from body
function enable() {

  const bodyElem = du.el( 'body' );

  if ( !bodyElem ) return;

  const style = _parseStyle( bodyElem.getAttribute( 'style' ) );

  style.overflow = undefined;

  bodyElem.setAttribute( 'style', _stringifyStyle( style ) );

}

// add overflow:hidden to body
function disable() {

  const bodyElem = du.el( 'body' );

  if ( !bodyElem ) return;

  const style = _parseStyle( bodyElem.getAttribute( 'style' ) );

  style.overflow = 'hidden';

  bodyElem.setAttribute( 'style', _stringifyStyle( style ) );

}

function _stringifyStyle( style ) {
  
  return Object.keys( style ).filter( k => !!k.length ).map( k => k + ':' + style[ k ] ).join( ';' );

}

function _parseStyle( style ) {

  const parsed = {};

  ( style || '' ).split( ';' ).forEach( part => {

    if ( !part.length ) return;

    const bits = part.split( '=' );

    parsed[ bits[ 0 ] ] = bits[ 1 ];

  } );

  return parsed;

}