"use strict";

const agendaStakeholders = require( '@openagenda/agenda-stakeholders' );
const wn = require( 'when/node' );

const defaultRoles = [ 'contributor', 'moderator', 'administrator' ];

module.exports = verify.bind( null, defaultRoles );

module.exports.allow = roles => verify.bind( null, roles );

async function verify( roles, req, res, next ) {

  const member = await wn.call( agendaStakeholders( req.agenda.id ).get, req.user.id, { instantiate: true } );

  if ( !member ) {

    return res.status( 403 ).json( {
      error: 'user is not a member of agenda',
      agendaUid: req.params.agendaUid
    } )

  }

  if ( ![ 'contributor', 'moderator', 'administrator' ].includes( agendaStakeholders.types.codes.get( member.credential ) ) ) {

    return res.status( 403 ).json( {
      error: 'user is not authorized to contribute to agenda',
      agendaUid: req.params.agendaUid
    } );

  }

  next();

}