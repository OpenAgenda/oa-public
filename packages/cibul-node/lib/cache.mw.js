"use strict";

const cacheMiddleware = require( 'simple-cache/middleware' ),

  sCache = require( 'simple-cache' ),

  _ = require( 'lodash' );

module.exports = {
  set,
  send
}

function send( namespace, path, responseType = 'json' ) {

  return cacheMiddleware( namespace, path, ( cached, req, res ) => {

    req.log( 'info', {
      cached: namespace + ':' + _.get( req, path ),
      message: 'cached response'
    } );

    res.set( 'Content-Type', 'application/json' );

    res.send( cached );

  } );

}

function set( namespace, path, delay, cacheFunc ) {

  return ( req, res, next ) => {

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