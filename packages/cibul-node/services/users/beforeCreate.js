'use strict';

const invitationsSvc = require( '@openagenda/invitations' );
const agendasSvc = require( '@openagenda/agendas' );
const config = require('../../config');

function blacklistByDomain(context) {
  const { data } = context;

  const domain = data.email.split('@')[1];

  if (config.blacklistedDomains.includes(domain)) {
    data.isBlacklisted = true;
  }
}

module.exports = function beforeCreate() {
  return async context => {
    const { data } = context;

    blacklistByDomain(context);

    if ( data.isActivated ) {
      return context;
    }

    const optionals = context.params.optionals || {};
    let invitation;

    if ( optionals.invitation ) {
      // invitation token from the optionals (query)
      ( { invitation } = await invitationsSvc.get( { token: optionals.invitation } ) );
    }

    if ( !invitation ) {
      // invitation linked to email
      ( { invitation } = await invitationsSvc.get( { email: data.email } ) );
    }

    if ( invitation && await isInvitedFromAnOfficialAgenda( invitation ) ) {
      data.isActivated = true;
    }

    return context;
  };
};

async function isInvitedFromAnOfficialAgenda( invitation ) {
  const linkMemberActions = invitation.data.actions.filter( v => v.name === 'linkMember' );

  let result = false;

  for ( const action of linkMemberActions ) {
    const agenda = await agendasSvc.get( action.params[ 0 ].agendaId, { private: null } );

    if ( agenda && agenda.official ) {
      result = true;
      break;
    }
  }

  return result;
}
