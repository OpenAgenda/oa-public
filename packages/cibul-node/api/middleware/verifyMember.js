"use strict";

const {
  isSuperiorTo
} = require( '@openagenda/members' ).utils.compareRoles;

const members = require( '../../services/members' );
const wn = require( 'when/node' );

const defaultRoles = [ 'contributor', 'moderator', 'administrator' ];

module.exports = verify.bind( null, defaultRoles );

module.exports.allow = roles => verify.bind( null, roles );

async function verify( roles, req, res, next ) {
  const member = await members.get( {
    agendaUid: req.agenda.uid,
    userUid: req.user.uid
  } );

  if ( !member ) {
    return res.status( 403 ).json( {
      error: 'user is not a member of agenda',
      agendaUid: req.params.agendaUid
    } );
  }

  if (  !isSuperiorTo( member.role, 'reader' ) ) {
    return res.status( 403 ).json( {
      error: 'user is not authorized to contribute to agenda',
      agendaUid: req.params.agendaUid
    } );
  }

  next();

}
