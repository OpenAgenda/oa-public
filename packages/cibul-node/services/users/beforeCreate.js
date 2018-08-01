'use strict';

const { promisify } = require( 'util' );
const invitationsSvc = require( '@openagenda/invitations' );
const agendasSvc = require( '@openagenda/agendas' );


module.exports = function beforeCreate() {
  // TODO if invited by an official agenda: set isActivated to true
  return async context => {
    const { data } = context;

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

    return context
  };
};

async function isInvitedFromAnOfficialAgenda( invitation ) {
  const linkStakeholderActions = invitation.data.actions.filter( v => v.name === 'linkStakeholder' );

  let result = false;

  for ( const action of linkStakeholderActions ) {
    const agenda = await promisify( agendasSvc.get )( action.params[ 0 ].agendaId );

    if ( agenda.official ) {
      result = true;
      break;
    }
  }

  return result;
}
