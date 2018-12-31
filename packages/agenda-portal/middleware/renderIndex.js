"use strict";

const _ = require( 'lodash' );

module.exports = async ( req, res, next ) => {

  if ( req.query.data !== undefined && process.env.NODE_ENV === 'development' ) {

    return res.json( _.assign( req.data, req.app.locals ) );

  }

  res.render( 'index', req.data );

}
