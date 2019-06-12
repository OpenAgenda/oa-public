"use strict";

const cacheMiddleware = require( '@openagenda/simple-cache/middleware' ),

  sCache = require( '@openagenda/simple-cache' ),

  _ = require( 'lodash' );

module.exports = {
  set,
  send,
  cache: sCache
}

function send( namespace, path, onSuccess ) {

  return cacheMiddleware( namespace, path, ( cached, req, res ) => {

    req.log( 'info', {
      cached: namespace + ':' + _.get( req, path ),
      message: 'cached response'
    } );

    onSuccess( cached, req, res );

  } );

}

function set( namespace, path, delay, cacheFunc ) {

  return ( req, res, next ) => {

    req.log( 'caching' );

    let identifier = _.get( req, path );

    sCache( namespace, identifier ).set( req.url, cacheFunc( req ), 10, err => {

      if ( err ) {

        req.log( 'error', {
          cached: namespace + ':' + identifier,
          error: err, message: 'caching error'
        } );

      } else {

        req.log( 'info', {
          cached: namespace + ':' + identifier,
          message: 'caching successful'
        } );

      }

    } );

    next();

  }

}
