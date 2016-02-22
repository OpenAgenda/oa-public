"use strict";

var xhr = require( 'xhr' ),

qs = require( 'qs' );

module.exports = function( res, data, cb ) {

  if ( arguments.length === 2 ) {

    cb = data;

    data = {};

  }

  xhr( {
    uri: res + '?' + qs.stringify( data ),
    method: 'get',
    json: true,
    headers: {
      'X-Requested-With': 'XMLHttpRequest'
    }
  }, ( err, result ) => {

    if ( err ) {

      return cb( err );

    }

    if ( result.statusCode !== 200 ) {

      return cb( { statusCode: result.statusCode } );

    }

    cb( null, result.body );

  } );

}