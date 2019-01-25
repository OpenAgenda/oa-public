"use strict";

var express = require( 'express' );

module.exports = {
  Router: Router,
  getPaths: getPaths
}

/**
 * simple express router wrapper
 * to simplify module definitions
 */

function Router( routes ) {

  var router = express.Router( {
    mergeParams: true
  } ),

  preMiddlewares = [];

  return {
    pre: pre,  // load middleware to be executed before main controllers
    load: load // load router in given app after having loaded main controllers
  }

  function pre( middlewares ) {

    preMiddlewares = middlewares;

  }

  function load( path ) {

    for ( var r in routes ) {

      router[ routes[ r ][ 0 ] ]( routes[ r ][ 1 ], [].concat( preMiddlewares, routes[ r ][ 2 ] ) );

    }

    return function( app ) {

      app.use( path, router );

    }

  }

}


function getPaths( basePath, routes ) {

  var paths = {};

  for( var r in routes ) {

    paths[ r ] = basePath + routes[ r ][ 1 ];

  }

  return paths;

}
