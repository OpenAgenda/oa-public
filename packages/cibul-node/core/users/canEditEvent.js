'use strict';

const log = require('@openagenda/logs')('core/users/canEditEvent');

const NotFoundError = require('../utils/NotFoundError');
const validateIdentifier = require('./lib/validateIdentifier');

const loadEvent = async (core, obj) => {
  const eventUid = obj instanceof Object ? obj.uid : obj;

  if (obj instanceof Object) {
    return obj;
  }

  const event = await core.services.events.get(eventUid, {
    includeFields: ['ownerUid', 'draft'],
    access: 'internal',
    private: null
  });

  if (!event) {
    throw new NotFoundError('event', eventUid)
  }

  return {
    ownerUid: event.ownerUid,
    uid: obj
  };
}

module.exports = async (core, userIdentifier, eventObj) => {
  const {
    agendaEvents,
    members,
    events,
    users
  } = core.services;

  const {
    isSuperiorToOrEqual
  } = members.utils.compareRoles;

  const user = await users.findOne({
    query: validateIdentifier(userIdentifier, { pickOne: true })
  });

  log('loaded user %s', user.uid);
  
  if (!user) {
    throw new NotFoundError('user', userIdentifier);
  }

  const {
    ownerUid,
    uid: eventUid,
    draft: isDraft
  } = await loadEvent(core, eventObj);

  if (isDraft && user.uid === ownerUid) {
    log('user %s is owner of event %s, can edit', user.uid, event.uid);
    return true;
  }

  const {
    items: agendaEventItems
  } = await agendaEvents.list.byEventUid(eventUid, { canEdit: true });

  const memberItems = await members.list({
    agendaUid: agendaEventItems.map(i => i.agendaUid),
    userUid: user.uid
  });

  for (const ae of agendaEventItems) {
    const member = memberItems.filter(m => m.agendaUid === ae.agendaUid).pop()

    if (!member) {
      // user is not member of agenda
      continue;
    }

    const isContributor = member.role === members.utils.roles.CONTRIBUTOR;
    const isOwner = user.uid === ownerUid;

    if (isContributor && isOwner) {
      log('user is contributor of agenda and owner of event');
      return true;
    }

    if (isSuperiorToOrEqual(member.role, 'contributor')) {
      log('user is administrator');
      return true;
    }
  }

  return false;
}