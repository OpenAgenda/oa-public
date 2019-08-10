"use strict";

const {
  isSuperiorTo
} = require( '@openagenda/members' ).utils.compareRoles;

module.exports = {
  moderator,
  moderatorCannotEditAdministrator,
  moderatorCannotInviteAdministrator,
  agendaHasInvitationMessageCredential
}

function moderator( req, res, next ) {
  if ( req.member && isSuperiorTo( req.member.role, 'contributor' ) ) {
    return next();
  }
  return next( { message: 'Not authorized', code: 403 } );
}

function moderatorCannotInviteAdministrator( req, res, next ) {
  if ( isSuperiorTo( req.body.role, req.member.role ) ) {
    return res.status( 400 ).json( { error: 'You cannot invite administrators' } );
  }
  return next();
}

function moderatorCannotEditAdministrator( req, res, next ) {
  if ( req.role === 'moderator' && req.targetMember.role === 'administrator' ) {
    return res.status( 400 ).json( { error: 'You cannot edit an administrator' } );
  }
  return next();
}

function agendaHasInvitationMessageCredential( req, res, next ) {
  if ( !req.agenda.credentials.invitationMessage ) {
    return res.status( 400 ).json( { error: 'This feature is not available on this agenda' } );
  }
  return next();
}
