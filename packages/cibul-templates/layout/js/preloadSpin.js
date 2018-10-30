"use strict";

const du = require( '@openagenda/dom-utils' );

const Spinner = require( 'spin.js' );

module.exports = () => {

  const el = du.el( '.js_preload_spin' );

  if ( !el ) return;

  if ( el.innerHTML.trim().length ) return;

  new Spinner( {
    width: 1,
    length: 6,
    radius: 10,
    color: '#666'
  } ).spin( el );

}
