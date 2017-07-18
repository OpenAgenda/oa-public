"use strict";

var xhr = require( 'xhr' );

module.exports = function( res, data, cb ) {

  if ( ( !res || !res.length ) && window ) {

    res = window.location.href;

  }

  xhr( {
    uri: res,
    method: 'post',
    json: true,
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json'
    },
    body: data,
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