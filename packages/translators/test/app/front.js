"use strict";

const config = require( '../../testconfig' );

const reverso = require( '../../src/reverso' );

window.onload = function() {

  let r = reverso( config.reverso );

  r( 'Brassée avec savoir-faire depuis 1664', [ 'en', 'it' ], ( err, translations ) => {

    document.querySelector( 'body' ).innerHTML = JSON.stringify( translations );

  } );

}