"use strict";

var xhr = require( 'xhr' );

module.exports = function( res, data, cb ) {

  xhr( {
    uri: res,
    method: 'post',
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify( data ),
    responseType: 'json'
  }, function( err, result ) {

    if ( err ) {

      return cb( err );

    }

    if ( result.statusCode !== 200 ) {

      return cb( { statusCode: result.statusCode } );

    }

    cb( null, result.body );

  } );

}