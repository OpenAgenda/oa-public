'use strict';

const log = require('@openagenda/logs')('core/agendas/utils/loadAuthorizations');

const canPublish = (agenda, access) => (
  agenda?.settings?.contribution?.canPublish
  || ['administrators', 'moderators']
).map(v => v.replace(/s$/, '')).includes(access);

// user can read if he is the contributing member...
// but we do not index this information...
const canRead = (compareRoles, agendaEvent, event, member) => (
  (agendaEvent.state === 2 && !event.private)
  || compareRoles.isSuperiorToOrEqual(member?.role, 'moderator')
  || (agendaEvent.userUid === member?.userUid)
);

const canCreateEvent = (services, member, agendaIsClosed) => {
  const {
    members: {
      utils: {
        compareRoles: {
          isSuperiorTo,
          isSuperiorToOrEqual
        }
      }
    }
  } = services;

  if (isSuperiorTo(member?.role, 'contributor')) {
    return true;
  }

  if (agendaIsClosed) {
    return false;
  }

  return isSuperiorToOrEqual(member?.role, 'contributor');
};

async function fromMember(core, agenda, agendaEvent, event, member) {
  const {
    members
  } = core.services;

  const {
    compareRoles,
    getRoleSlug
  } = members.utils;

  const memberRole = member ? getRoleSlug(member.role) : null;
  const agendaIsClosed = await core.agendas(agenda).settings.isClosed();

  log('fromMember with %s role %s', memberRole, agendaIsClosed ? ' on closed agenda' : '');

  const canEditEvent = (member && !agendaIsClosed && event && member && await core.users(member.userUid).canEditEvent(event)) ?? false;

  return {
    canRead: agendaEvent ? canRead(compareRoles, agendaEvent, event, member) : canEditEvent,
    mustBeModerated: (member && ((agenda?.settings?.contribution?.moderateOnChangeBy || []).includes(memberRole))) ?? false,
    canChangeState: (member && compareRoles.isSuperiorToOrEqual(member?.role, 'moderator', { throwIfUnknown: false })) ?? false,
    canPublish: (member && canPublish(agenda, memberRole)) ?? false,
    canEditEvent,
    canCreateEvent: canCreateEvent(core.services, member, agendaIsClosed),
    canContribute: (member && !agendaIsClosed && compareRoles.isSuperiorToOrEqual(member?.role, 'contributor')) ?? false
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
  if (member) {
    return fromMember(core, agenda, agendaEvent, event, member);
  }

  return fromAccess(core, agenda, agendaEvent, access);
};

module.exports.getForUserOnAgenda = async (core, userUid, agendaUid, event, options = {}) => {
  log('getForUserOnAgenda');

  const {
    promisedAccess = null,
    agendaEvent: preloadedAgendaEvent = null
  } = options;

  const {
    services
  } = core;

  const {
    agendas,
    members,
    agendaEvents
  } = services;

  const member = await members.get({ agendaUid, userUid });

  const agenda = await agendas.get({ uid: agendaUid }, {
    internal: true,
    private: null,
    includeImagePath: true
  });
  const agendaEvent = preloadedAgendaEvent || (event?.uid && await agendaEvents(agendaUid).get(event.uid));

  if (promisedAccess) {
    return fromAccess(
      core,
      agenda,
      event ? await agenda.changeEventState(agenda.uid).get(event.uid) : null,
      promisedAccess
    );
  }

  return fromMember(
    core,
    agenda,
    agendaEvent,
    event,
    member
  );
};

module.exports.filterUnauthorized = (clean, data, authorizations) => {
  if (!authorizations.canEditEvent && clean.event) {
    delete clean.event;
  }

  if (!authorizations.canChangeState && data?.state !== undefined) {
    delete clean.agendaEvent.state;
    delete data.state;
  }

  if (!authorizations.canPublish && parseInt(clean.agendaEvent?.state, 10) === 2) {
    delete clean.agendaEvent.state;
    delete data.state;
  }
};
