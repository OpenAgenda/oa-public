"use strict";

const _ = require( 'lodash' );

module.exports = async ( req, res, next ) => {

  const proxy = req.app.get( 'proxy' );
  const parsers = req.app.get( 'parsers' );

  const event = await req.app.get( 'proxy' ).get( { slug: req.params.slug } );

  if ( !event ) return next();

  res.render( 'event', _.assign( req.data, {
    event: parsers.detailedEvent(
      parsers.event( event )
    )
  } ) );

}
