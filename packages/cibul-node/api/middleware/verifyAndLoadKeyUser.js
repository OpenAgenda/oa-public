"use strict";

const accessTokens = require( '../../services/accessTokens' );

module.exports = async ( req, res, next ) => {

  try {

    req.user = await accessTokens.getUserFromKey( req.app.services, req.query.key );

    if ( !req.user ) throw new Error( 'could not find user matching token' );

  } catch( e ) {

    return res.status( 403 ).json( {
      error: e.message
    } );

  }

  next();

}
