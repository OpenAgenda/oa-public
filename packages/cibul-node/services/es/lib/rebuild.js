"use strict";

var lib,

async = require( 'async' ),

model = require( '../../model' ),

utils = require( 'utils' ),

log = require( 'logger' )( 'es svc rebuild' );

module.exports = function( cb ) {

  if ( !lib ) return cb( 'es is not inited' );

  async.series( [
    lib.resetIndex,
    _populate( 'reviews' ),
    _populate( 'events' ),
    lib.refreshIndex
  ], cb );

}

module.exports.set = function( l ) {

  lib = l;

}



function _populate( schema ) {

  var type = ( schema == 'events' ? 'event' : 'review' );

  var params = schema == 'events' ? { isPublished: null } : {};

  return function( cb ) {

    var loopCount = 1;

    log( 'debug', 'populating type %s', type );

    _loopThroughPages( schema, params, function( results, next ) {

      log( 'debug', 'looping %s', loopCount++ );

      lib[ schema ]().bulk( results, function( err, result ) {

        if ( err ) return cb( err );

        next();

      });

    }, cb );

  };

}


function _loopThroughPages( schema, params, usageFunc, finishCallback ) {

  if ( arguments.length === 3 ) {

    finishCallback = usageFunc;

    usageFunc = params;

    params = {};

  }

  function fetchPage( offset, limit ) {

    log( 'debug', 'fetching data with offset %s', offset );

    model[ schema ]().list( utils.extend( {
      extended: true,
      offset: offset,
      limit : limit
    }, params ), function( err, result ) {

      if ( err || !result || !result.length ) return finishCallback( err );

      usageFunc( result, function() {
        
        fetchPage( offset + limit, limit );

      } );

    });

  };

  fetchPage( 0, 40 );

}