'use strict';

const log = require('@openagenda/logs')('core/agendas/utils/loadAuthorizations');

const canPublish = (agenda, access) => (
  agenda?.settings?.contribution?.canPublish
  || ['administrators', 'moderators']
).map(v => v.replace(/s$/, '')).includes(access);

async function fromMember(core, agenda, event, member) {
  const {
    members
  } = core.services;

  const {
    compareRoles,
    getRoleSlug
  } = members.utils;

  const memberRole = getRoleSlug(member.role);
  const agendaIsClosed = await core.agendas(agenda).settings.isClosed();

  log('fromMember with %s role %s', memberRole, agendaIsClosed ? ' on closed agenda' : '');

  return {
    mustBeModerated: (agenda?.settings?.contribution?.moderateOnChangeBy || []).includes(memberRole),
    canChangeState: compareRoles.isSuperiorToOrEqual(member?.role, 'moderator', { throwIfUnknown: false }),
    canPublish: canPublish(agenda, memberRole),
    canEditEvent: !agendaIsClosed && event && await core.users(member.userUid).canEditEvent(event),
    canCreateEvent: !agendaIsClosed && compareRoles.isSuperiorToOrEqual(member?.role, 'contributor')
  };
}

async function fromAccess(core, agenda, agendaEvent, access) {
  const {
    compareRoles,
  } = core.services.members.utils;

  const isAtLeastContributor = compareRoles.isSuperiorToOrEqual(access, 'contributor');
  const agendaIsClosed = await core.agendas(agenda).settings.isClosed();

  return {
    mustBeModerated: (agenda?.settings?.contribution?.moderateOnChangeBy || []).includes(access),
    canChangeState: compareRoles.isSuperiorToOrEqual(access, 'moderator', { throwIfUnknown: false }),
    canPublish: canPublish(agenda, access),
    canEditEvent: !agendaIsClosed && isAtLeastContributor && (agendaEvent ? agendaEvent.canEdit : true),
    canCreateEvent: !agendaIsClosed && compareRoles.isSuperiorToOrEqual(access, 'contributor')
  };
}

module.exports = (core, operation, {
  agenda,
  agendaEvent,
  event,
  member,
  access
}) => {
  const context = {
    agenda,
    agendaEvent,
    event,
    operation
  };

  if (member) {
    return fromMember(core, agenda, event, member);
  } else {
    return fromAccess(core, agenda, agendaEvent, access);
  }
}

module.exports.getForUserOnAgenda = async (core, userUid, agendaUid, event, promisedAccess = null) => {
  log('getForUserOnAgenda');
  
  const {
    services
  } = core;

  const {
    agendas,
    members
  } = services;

  const member = await members.get({ agendaUid, userUid });
  const agenda = await agendas.get({ uid: agendaUid }, {
    internal: true,
    private: null,
    includeImagePath: true
  });

  if (!member) {
    log('getForUserOnAgenda - user %s is not a member of %s', userUid, agendaUid);
  }

  if (member) {
    return fromMember(
      core,
      agenda,
      event,
      member
    );
  } else if (promisedAccess) {
    return fromAccess(
      core,
      agenda,
      event ? await agenda.changeEventState(agenda.uid).get(event.uid) : null,
      promisedAccess
    );
  } else {
    return [];
  }
}

module.exports.filterUnauthorized = (clean, data, authorizations) => {
  if (!authorizations.canEditEvent && clean.event) {
    delete clean.event;
  }

  if (!authorizations.canChangeState && data?.state !== undefined) {
    delete clean.agendaEvent.state;
    delete data.state;
  }

  if (!authorizations.canPublish && parseInt(clean.agendaEvent?.state) === 2) {
    delete clean.agendaEvent.state;
    delete data.state;
  }
}