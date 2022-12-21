'use strict';

function blacklistByDomain(config, context) {
  const { data } = context;

  const domain = data.email.split('@')[1];

  if (config.blacklistedDomains.includes(domain)) {
    data.isBlacklisted = true;
  }
}

async function isInvitedFromAnOfficialAgenda(services, invitation) {
  const {
    agendas: agendasSvc,
  } = services;

  const linkMemberActions = invitation.data.actions.filter(v => v.name === 'linkMember');

  let result = false;

  for (const action of linkMemberActions) {
    const agenda = await agendasSvc.get(action.params[0].agendaId, {
      private: null,
    });

    if (agenda && agenda.official) {
      result = true;
      break;
    }
  }

  return result;
}

module.exports = (config, services) => async context => {
  const {
    invitations: invitationsSvc,
  } = services;

  const { data } = context;

  blacklistByDomain(config, context);

  if (data.isActivated) {
    return context;
  }

  const optionals = context.params.optionals || {};
  let invitation;

  if (optionals.invitation) {
    // invitation token from the optionals (query)
    ({ invitation } = await invitationsSvc.get({
      token: optionals.invitation,
    }));
  }

  if (!invitation) {
    // invitation linked to email
    ({ invitation } = await invitationsSvc.get({
      email: data.email,
    }));
  }

  if (invitation && await isInvitedFromAnOfficialAgenda(services, invitation)) {
    data.isActivated = true;
  }

  return context;
};
