"use strict";

const w = require( 'when' );

const isPromise = obj =>
  !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';

module.exports = function cbify( fn ) {

  return ( ...params ) => {

    const cb = params[ params.length - 1 ];

    w( fn( ...params.slice( 0, -1 ), cb ) )
      .done( res => {
        if ( isPromise( res ) ) cb( null, res );
      }, err => {
        if ( isPromise( err ) ) cb( err );
      } );

  };

}
