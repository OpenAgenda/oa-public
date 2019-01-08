"use strict";

module.exports = async ( req, res, next ) => {

  const parsers = req.app.get( 'parsers' );

  const event = await req.app.get( 'proxy' ).get( { uid: req.params.uid } );

  if ( !event ) return next();

  res.redirect( 301, parsers.event( event ).link );

}
