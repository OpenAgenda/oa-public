"use strict";

const du = require( 'dom-utils' );

module.exports = ( selector, cb ) => {

  if ( typeof window === 'undefined' || typeof document === 'undefined' ) return; // server!

  let elem = du.el( selector );

  if ( !elem ) return;

  du.addEvent( elem, 'keyup', e => {

    if ( e.keyCode !== 13 ) return;

    cb( e.target.value ); 

  } );

}