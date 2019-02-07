"use strict";

const _ = require( 'lodash' );

let config;

module.exports = ( name, request, response ) => {

  let values = _decode( request, name );

  return {
    set,
    clear,
    get: () => values
  }

  function clear() {

    if ( typeof response.cookie !== 'function' ) return;

    response.cookie( name, ( new Buffer( JSON.stringify( {} ), 'utf8' ) ).toString( 'base64' ), { maxAge: 1 } );

  }

  function set( key, update ) {

    _.set( values, key, update );

    let encoded = ( new Buffer( JSON.stringify( values ), 'utf8' ) ).toString( 'base64' );

    request.cookies[ name ] = encoded;

    response.cookie( name, encoded, { maxAge: config.writableCookie.maxAge, encode: str => str } );

  }

}


function _decode( req, name ) {

  const encoded = req.cookies[ name ];

  let decoded = {};

  if ( !encoded ) return decoded;

  try {

    decoded = JSON.parse(
      ( new Buffer( encoded, 'base64' ) ).toString( 'utf8' )
    );

  } catch( e ) {}

  return decoded;

}

module.exports.init = c => config = c;