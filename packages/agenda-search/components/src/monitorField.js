"use strict";

const du = require( '@openagenda/dom-utils' );

module.exports = ( selector, cb ) => {

  if ( typeof window === 'undefined' || typeof document === 'undefined' ) return; // server!

  const formElem = du.el( selector );

  if ( !formElem ) return;

  const inputElem = du.el( formElem, 'input' );

  if ( !inputElem ) return;

  du.addEvent( formElem, 'submit', e => {

    e.preventDefault();

    cb( inputElem.value );

  } );

}
