"use strict";

const du = require( '@openagenda/dom-utils' );

module.exports = ( selector, cb ) => {

  if ( typeof window === 'undefined' || typeof document === 'undefined' ) return; // server!

  let formElem = du.el( selector ),

  inputElem = du.el( formElem, 'input' );

  if ( !formElem || !inputElem ) return;

  du.addEvent( formElem, 'submit', e => {

    e.preventDefault();

    cb( inputElem.value ); 

  } );

}