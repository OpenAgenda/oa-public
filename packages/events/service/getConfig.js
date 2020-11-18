"use strict";

let config;

module.exports = () => config;

module.exports.init = function( svc, c ) {

  config = c;

}
