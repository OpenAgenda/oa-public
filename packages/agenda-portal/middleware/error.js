"use strict";

const _ = require( 'lodash' );

const log = require( '../lib/Log' )( 'middleware/error' );

const pageGlobals = require( './pageGlobals' );

module.exports = ( err, req, res, next ) => {

  log( 'error', err );

  pageGlobals( req, res, () => {

    res.status( 500 ).render( 'error', _.assign( req.data || {}, {
      message: process.env.NODE_ENV === 'development' ? err.message : null
    } ) );

  } );

}
