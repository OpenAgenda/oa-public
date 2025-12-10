import logs from '@openagenda/logs';

const log = logs('core/agendas/utils/authorizations');

const canPublish = (agenda, access) =>
  (
    agenda?.settings?.contribution?.canPublish || [
      'administrators',
      'moderators',
    ]
  )
    .map((v) => v.replace(/s$/, ''))
    .includes(access);

function canRead(compareRoles, agendaEvent, event, member) {
  const evals = [];
  // event is published on a public agenda
  if (agendaEvent.state === 2 && !event.private) {
    return true;
  }
  evals.push('event is not published on a public agenda');
  // user is moderator
  if (compareRoles.isSuperiorToOrEqual(member?.role, 'moderator')) {
    return true;
  }
  evals.push('user is not an adminmod');
  // user is the contributing member
  if (agendaEvent.userUid === member?.userUid) {
    return true;
  }
  evals.push('user is not the contributing member');
  // event is private and published and user is contributor of the agenda
  if (
    agendaEvent.state === 2
    && event.private
    && compareRoles.isSuperiorToOrEqual(member?.role, 'contributor')
  ) {
    return true;
  }
  log.info('user does not have read access', {
    userUid: member?.userUid,
    eventUid: event.uid,
    evals,
  });
  return false;
}

function canRemoveEvent(services, { member, agendaEvent, access }) {
  const {
    members: {
      utils: {
        compareRoles: { isSuperiorToOrEqual },
      },
    },
  } = services;

  // user is moderator or better
  if (isSuperiorToOrEqual(member?.role ?? access, 'moderator')) {
    return true;
  }

  if (!agendaEvent) {
    return null;
  }

  return false;
}

function canDeleteEvent(services, { member, agendaEvent, event, access }) {
  if (!event) {
    return null;
  }

  const isEventOwner = member?.userUid === event.ownerUid;

  if (event.draft) {
    return isEventOwner;
  }

  if (member && isEventOwner) {
    return true;
  }

  if (!agendaEvent) {
    return null;
  }

  const isOriginAgenda = event.agendaUid === agendaEvent.agendaUid;

  if (!canRemoveEvent(services, { access, member, agendaEvent })) {
    return false;
  }
  return !!isOriginAgenda;
}

const canCreateEvent = (services, member, agendaIsClosed) => {
  const {
    members: {
      utils: {
        compareRoles: { isSuperiorTo, isSuperiorToOrEqual },
      },
    },
  } = services;

  if (isSuperiorTo(member?.role, 'contributor')) {
    return true;
  }

  if (agendaIsClosed) {
    return false;
  }

  return isSuperiorToOrEqual(member?.role, 'contributor');
};

const getCanEditEventOnAgenda = async (
  core,
  member,
  event,
  { agendaIsClosed, userUid, isMemberDataRequired },
) => {
  const { members } = core.services;

  const { compareRoles } = members.utils;

  if (agendaIsClosed && compareRoles.isInferiorTo(member?.role, 'moderator')) {
    return false;
  }

  return !!(
    (member || (!isMemberDataRequired && event.draft)) // a draft event may be edited by a user who is not yet a member
    && event
    && await core.users(member?.userUid ?? userUid).canEditEvent(event)
  );
};

function canContribute(
  services,
  member,
  { agendaIsClosed, isMemberDataRequired },
) {
  const {
    members: {
      utils: { compareRoles },
    },
  } = services;

  if (!member && !isMemberDataRequired) {
    return true;
  }

  return (
    (member
      && !agendaIsClosed
      && compareRoles.isSuperiorToOrEqual(member?.role, 'contributor'))
    ?? false
  );
}

async function fromMember(
  core,
  agenda,
  agendaEvent,
  event,
  member,
  options = {},
) {
  const { members } = core.services;
  const { userUid } = options;

  const { compareRoles, getRoleSlug } = members.utils;

  const memberRole = member ? getRoleSlug(member.role) : null;
  const agendaIsClosed = await core.agendas(agenda).settings.isClosed();
  const isMemberDataRequired = await core
    .agendas(agenda)
    .settings.isMemberDataRequired();

  log(
    'fromMember with %s role %s',
    memberRole,
    agendaIsClosed ? ' on closed agenda' : '',
  );

  const canEditEvent = await getCanEditEventOnAgenda(core, member, event, {
    agendaIsClosed,
    isMemberDataRequired,
    userUid,
  });

  return {
    canRead: agendaEvent
      ? canRead(compareRoles, agendaEvent, event, member)
      : canEditEvent,
    mustBeModerated:
      (member
        && (agenda?.settings?.contribution?.moderateOnChangeBy || []).includes(
          memberRole,
        ))
      ?? false,
    canChangeState:
      (member
        && compareRoles.isSuperiorToOrEqual(member?.role, 'moderator', {
          throwIfUnknown: false,
        }))
      ?? false,
    canPublish: (member && canPublish(agenda, memberRole)) ?? false,
    canEditEvent,
    canCreateEvent: canCreateEvent(core.services, member, agendaIsClosed),
    canRemoveEvent: canRemoveEvent(core.services, { member, agendaEvent }),
    canDeleteEvent: canDeleteEvent(core.services, {
      member,
      event,
      agendaEvent,
    }),
    canContribute: canContribute(core.services, member, {
      agendaIsClosed,
      isMemberDataRequired,
    }),
  };
}

async function fromAccess(core, agenda, agendaEvent, event, access) {
  const { compareRoles } = core.services.members.utils;

  const isAtLeastContributor = compareRoles.isSuperiorToOrEqual(access, 'contributor')
    || access === 'internal';
  const agendaIsClosed = await core.agendas(agenda).settings.isClosed();

  if (access === 'internal') {
    return {
      mustBeModerated: false,
      canChangeState: true,
      canPublish: true,
      canEditEvent: true,
      canCreateEvent: true,
      canRemoveEvent: true,
      canDeleteEvent: true,
    };
  }

  return {
    mustBeModerated: (
      agenda?.settings?.contribution?.moderateOnChangeBy || []
    ).includes(access),
    canChangeState: compareRoles.isSuperiorToOrEqual(access, 'moderator', {
      throwIfUnknown: false,
    }),
    canPublish: canPublish(agenda, access),
    canEditEvent:
      !agendaIsClosed
      && isAtLeastContributor
      && (agendaEvent ? agendaEvent.canEdit : true),
    canCreateEvent:
      !agendaIsClosed
      && compareRoles.isSuperiorToOrEqual(access, 'contributor'),
    canRemoveEvent: canRemoveEvent(core.services, { access, agendaEvent }),
    canDeleteEvent: canDeleteEvent(core.services, {
      agenda,
      agendaEvent,
      event,
      access,
    }),
  };
}

export default (
  core,
  _operation,
  { agenda, agendaEvent, event, member, access, userUid },
) => {
  const hasActingUserUid = !!(member?.userUid || userUid);
  if (hasActingUserUid && access !== 'internal') {
    return fromMember(core, agenda, agendaEvent, event, member, { userUid });
  }

  return fromAccess(core, agenda, agendaEvent, event, access);
};

export function getAccessFromMember(services, member, defaultAccess) {
  const {
    members: {
      utils: { getRoleSlug },
    },
  } = services;

  if (member) {
    return getRoleSlug(member.role);
  }

  return defaultAccess;
}

export async function getForUserOnAgenda(
  core,
  userUid,
  agendaUid,
  event,
  options = {},
) {
  log('getForUserOnAgenda');

  const { promisedAccess = null, agendaEvent: preloadedAgendaEvent = null } = options;

  const { services } = core;

  const { agendas, members, agendaEvents } = services;

  const member = await members.get({ agendaUid, userUid });

  const agenda = await agendas.get(
    { uid: agendaUid },
    {
      internal: true,
      private: null,
      includeImagePath: true,
    },
  );
  const agendaEvent = preloadedAgendaEvent
    || (event?.uid && await agendaEvents(agendaUid).get(event.uid));

  if (promisedAccess) {
    return fromAccess(
      core,
      agenda,
      event ? await agenda.changeEventState(agenda.uid).get(event.uid) : null,
      event,
      promisedAccess,
    );
  }

  return fromMember(core, agenda, agendaEvent, event, member, { userUid });
}

export function filterUnauthorized(clean, data, authorizations) {
  if (!authorizations.canEditEvent && clean.event) {
    delete clean.event;
  }

  if (!authorizations.canChangeState && data?.state !== undefined) {
    delete clean.agendaEvent.state;
    delete data.state;
  }

  if (
    !authorizations.canPublish
    && parseInt(clean.agendaEvent?.state, 10) === 2
  ) {
    delete clean.agendaEvent.state;
    delete data.state;
  }
}
