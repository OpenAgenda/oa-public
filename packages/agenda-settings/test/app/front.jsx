"use strict";

var main = require( '../../react/src/index' );

window.onload = function () {

  main( {
    lang: window.location.href.indexOf( 'lang=en' ) !== -1 ? 'en' : 'fr'
  } );

};