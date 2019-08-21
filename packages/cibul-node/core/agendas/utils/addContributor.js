"use strict";

const _ = require( 'lodash' );
const { promisify } = require( 'util' );

const agendaStakeholders = require( '@openagenda/agenda-stakeholders' );
const contributionTypes = require( '@openagenda/agendas' ).contributionTypes;

const members = require( '../../../services/members' );

module.exports = Object.assign( async ( agenda, userUid ) => {

  const users = app.service( '/users' );

  return promisify( agendaStakeholders.agenda( agenda.id ).create )( {
    email: ( await users.get( userUid ) ).email
  }, { allowPartial: true } );

}, {
  agendaIsOpen: agenda => _.get( agenda, 'settings.contribution.type' ) === contributionTypes.OPEN,
  userIsNotMember
} );

async function userIsNotMember( agenda, userUid ) {

  return !( await members.get( {
    agendaUid: agenda.uid,
    userUid
  } ) );

}
