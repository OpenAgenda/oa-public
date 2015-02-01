"use strict";

var passport = require( 'passport' ),

strategies = {};

module.exports = {
  loadStrategy: loadStrategy,
  use: use,
  authenticate: authenticate,
  initialize: initialize
}

function loadStrategy( name, libName, attr ) {

  if ( !attr ) attr = 'Strategy';

  strategies[ name ] = require( libName )[ attr ];

}

function authenticate( name, options, authFunc ) {

  return passport.authenticate( name, options, authFunc );

}

function use( name, strategyName, strategyParams, authFunc ) {

  var strategyInstance = new strategies[ strategyName ]( strategyParams, authFunc );

  passport.use( name, strategyInstance );

}

function initialize() {

  return passport.initialize();

}