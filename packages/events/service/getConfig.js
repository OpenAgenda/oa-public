"use strict";

const utils = require( 'utils' );

let config;

module.exports = () => config;

module.exports.init = function( svc, c ) {

  config = c;

}