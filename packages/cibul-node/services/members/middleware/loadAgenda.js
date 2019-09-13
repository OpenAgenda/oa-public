"use strict";

const agendasSvc = require( '@openagenda/agendas' );

const getRoleCode = require( '@openagenda/members' ).utils.getRoleCode;

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

module.exports.roles = ( req, res, next ) => {
  req.agendaRoles = [ 'contributor', 'administrator' ]
    .concat( req.agenda.credentials.moderators ? [ 'moderator' ] : [] )
    .concat( req.agenda.private ? [ 'reader' ] : [] )
    .map( s => ( {
      slug: s,
      code: getRoleCode( s )
    } ) );

  next();
}
