import logs from '@openagenda/logs';
import { NotFound } from '@openagenda/verror';
import validateIdentifier from './lib/validateIdentifier.js';

const log = logs('core/users/canEditEvent');

const loadEvent = async (core, obj) => {
  const eventUid = obj instanceof Object ? obj.uid : obj;

  if (obj instanceof Object && obj.ownerUid && obj.draft !== undefined) {
    return obj;
  }

  const event = await core.services.events.get(eventUid, {
    includeFields: ['ownerUid', 'draft'],
    access: 'internal',
    private: null,
  });

  if (!event) {
    throw new NotFound({ info: { uid: eventUid } }, 'event not found');
  }

  return {
    draft: event.draft,
    ownerUid: event.ownerUid,
    uid: obj instanceof Object ? obj.uid : obj,
  };
};

export default async (core, userIdentifier, eventObj) => {
  const { agendaEvents, members, users } = core.services;

  const { isSuperiorToOrEqual } = members.utils.compareRoles;

  const user = await users.findOne({
    query: validateIdentifier(userIdentifier, { pickOne: true }),
  });

  log('loaded user %s', user.uid);

  if (!user) {
    throw new NotFound(
      {
        info: { uid: userIdentifier },
      },
      'user not found',
    );
  }

  const {
    ownerUid,
    uid: eventUid,
    draft: isDraft,
  } = await loadEvent(core, eventObj);

  // ownerUid and user.uid may differ in type (one stored as a string, the
  // other as a number), so compare as strings — mirrors canDeleteEvent.
  const isOwner = user.uid != null && String(user.uid) === String(ownerUid);

  if (isDraft && isOwner) {
    log('user %s is owner of event %s, can edit', user.uid, eventUid);
    return true;
  }

  const { items: agendaEventItems } = await agendaEvents.list.byEventUid(
    eventUid,
    { canEdit: true },
  );

  const memberItems = await members.list({
    agendaUid: agendaEventItems.map((i) => i.agendaUid),
    userUid: user.uid,
  });

  for (const ae of agendaEventItems) {
    const member = memberItems
      .filter((m) => m.agendaUid === ae.agendaUid)
      .pop();

    if (!member) {
      // user is not member of agenda
      continue;
    }

    const isContributor = member.role === members.utils.roles.CONTRIBUTOR;

    if (isContributor && isOwner) {
      log('user is contributor of agenda and owner of event');
      return true;
    }

    if (isSuperiorToOrEqual(member.role, 'moderator')) {
      log('user is adminmod of an agenda that has edition rights over event');
      return true;
    }
  }

  return false;
};
