"use strict";

module.exports = ( req, res, next ) => {
  if ( req.agendaEvent.canEdit ) return next();
  next( {
    code: 403,
    error: 'requireCanEdit',
    message: 'Agenda does not have admin rights over event'
  } );
}
