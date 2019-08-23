"use strict";

const _ = require( 'lodash' );
const { promisify } = require( 'util' );
const contributionTypes = require( '@openagenda/agendas' ).contributionTypes;
const members = require( '../../../services/members' );
const users = require( '../../../services/users' );

module.exports = Object.assign( async ( agenda, userUid ) => {
  return members.create( { agendaUid: agenda.uid, userUid, role: 1,
    custom: {
      email: ( await users.get( userUid ) ).email
    }
  }, { requireCustom: false } );
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
