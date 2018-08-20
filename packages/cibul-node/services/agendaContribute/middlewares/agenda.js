"use strict";

const agendas = require( '@openagenda/agendas' );
const log = require( '@openagenda/logs' )( 'services/agendaContribute/middlewares/agenda' );

module.exports = function( req, res, next ) {

  log( 'loading agenda from path %s', req.baseUrl );

  const agendaSlug = req.baseUrl.split( '/' )[ 1 ];

  log( 'loading agenda %s', agendaSlug );

  agendas.get( { slug: agendaSlug }, { private: null, internal: true }, ( err, agenda ) => {

    if ( err ) return next( err );

    req.agenda = agenda;

    next();

  } );

}
