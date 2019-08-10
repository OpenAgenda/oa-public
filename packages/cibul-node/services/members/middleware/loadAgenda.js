"use strict";

const agendasSvc = require( '@openagenda/agendas' );

module.exports = ( req, res, next ) => {
  agendasSvc.get( { slug: req.params.agendaSlug }, {
    private: null,
    internal: true,
    includeImagePath: true
  } ).then( agenda => {
    if ( !agenda ) return next( { code: 404 } );
    req.agenda = agenda;
    next();
  } );
}
