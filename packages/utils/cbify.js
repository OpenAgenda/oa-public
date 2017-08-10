"use strict";

const w = require( 'when' );

module.exports = function cbify( fn ) {

  return ( ...params ) => {
    let cbCalled = false;
    const cb = params[ params.length - 1 ];

    const _cb = ( ...result ) => {
      cbCalled = true;
      return cb( ...result );
    }

    w( fn( ...params.slice( 0, -1 ), _cb ) )
      .done( res => {
        if ( cbCalled ) return;
        return cb( null, res );
      }, err => {
        if ( cbCalled ) return;
        return cb( err );
      } );

  };

}
