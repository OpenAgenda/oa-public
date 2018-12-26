"use strict";

const pageGlobals = require( './pageGlobals' );

module.exports = ( err, req, res, next ) => {

  pageGlobals( req, res, () => {

    res.status( 500 ).render( 'error', req.data );

  } );

}
