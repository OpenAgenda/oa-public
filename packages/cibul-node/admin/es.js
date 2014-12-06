/**
 * simple es library
 */

var config,

http = require( 'http' );

module.exports = function( cfg ) {

  config = cfg;

  return {
    query: query
  }

}

function query( type, dsl, cb ) {

  _request( 'post', '/' + config.indexName + '/' + type + '/_search?pretty=true', dsl, cb );

}

function _request( method, path, data, cb ) {

  var clean = typeof data !== 'string' ? JSON.stringify( data ) : data,

  req = http.request({
    host: config.host,
    port: config.port,
    path: path,
    method: method,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': clean ? Buffer.byteLength( clean ) : 0
    }
  }, _handleResponse( cb ) );

  console.log( clean );

  req.write( clean );

  req.end();

}

function _handleResponse( cb ) {

  return function( res ) {

    var response = [];

    res.setEncoding( 'utf8' );

    res.on( 'data', function ( chunk ) {

      response.push( chunk );

    });

    res.on( 'end', function() {

      var result = {};

      if ( response.length ) result = JSON.parse( response.join('') );

      result.statusCode = res.statusCode; 

      cb( result.errors || result.error || null, result );

    });

  };

}