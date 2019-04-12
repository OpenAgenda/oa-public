"use strict";

const log = require( '@openagenda/logs' )( 'services/agendaContribute/middlewares/defineUpdateRedirect' );

module.exports = ( req, res, next ) => {

  req.updateRedirect = null;

  try {

    log( 'decoding redirect %s', req.query.redirect );

    req.updateRedirect = new Buffer( req.query.redirect, 'base64' ).toString();

  } catch ( e ) {}

  next();

}
