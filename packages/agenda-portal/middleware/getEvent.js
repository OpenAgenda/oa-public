"use strict";

const _ = require( 'lodash' );

module.exports = async ( req, res, next ) => {

  const proxy = req.app.get( 'proxy' );
  const parsers = req.app.get( 'parsers' );

  const event = await proxy.get( res.locals.agendaUid, {
    slug: req.params.slug
  } );

  if ( !event ) return next();

  _.assign( req.data, {
    event: parsers.detailedEvent(
      parsers.event( event, req, res ),
      req
    )
  } );

  if ( req.params.timing ) {
    req.data.event.timing = _.find(
      req.data.event.timings,
      t => new Date( t.start ).getTime() + '' === req.params.timing
    );
  }

  if ( req.query.nc ) {

  }

  if ( req.query.data !== undefined && process.env.NODE_ENV === 'development' ) {

    return res.json( _.assign( req.data, req.app.locals ) );

  }

  res.render( 'event', req.data );

}
