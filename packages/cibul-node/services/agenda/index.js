"use strict";

var log = require( 'logger' )( 'agenda service' ),

model = require( '../model' ),

cache = require( '../cache' ),

config = require( '../../config' ),

es = require( '../elasticsearch' );

module.exports = {
  list: model.agendas().list,
  search: search,
  get: get,
  instanciate: require( './instance' )
}

module.exports.mw = require( './middleware' )( module.exports );

module.exports.exports = require( './exportLib' )( module.exports ); 

module.exports.tags = require( './tags' )( module.exports );

function search( query, options, cb ) {

  es.searchAgendas( query, options, cb );

}


function get( queryParams, options, cb ) {

  if ( arguments.length == 2 ) {

    cb = options;

    options = {};

  }

  log( 'getting agenda data %s', JSON.stringify( queryParams ) );

  var get = model.agendas().get;

  if ( options.cache ) {

    get = cache.func( 'agendas', 'get', get, config.agendaCacheExpire );

  }

  get( queryParams, function( err, result ) {

    log( 'retrieved agenda data %s', JSON.stringify( queryParams ) );

    if ( err ) return cb( err );

    if ( !result ) return cb( 'agenda not found' );

    cb( null, module.exports.instanciate( result ) );

  });

}