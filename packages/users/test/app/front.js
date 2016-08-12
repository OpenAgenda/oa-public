"use strict";

const config = require( '../../testconfig' ),

  main = require( '../../react/src' );


window.onload = function() {

  window.env = config.debug ? 'dev' : 'prod';

  main();

};
