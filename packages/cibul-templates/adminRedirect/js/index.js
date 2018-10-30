"use strict";

const Spinner = require( 'spin.js' );

const du = require( '@openagenda/dom-utils' );

window.asap( function( options ) {

  new Spinner( {
    width: 1,
    length: 6,
    radius: 10,
    color: '#666'
  } ).spin( du.el( '.js_spinner' ) );

  setTimeout( () => {

    window.location.href = options.redirect;

  }, 5000 );

} );
