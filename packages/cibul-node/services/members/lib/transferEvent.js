'use strict';

const log = require('@openagenda/logs')('services/members/transferEvent');

function feedFollow(activities, follow, userUid, eventUid) {
  return activities.feed({
    entityType: 'user',
    entityUid: userUid
  })[follow ? 'follow' : 'unfollow']({
    entityType: 'event',
    entityUid: eventUid
  });
}

module.exports = async function transferEvent(services, event, member) {
  const {
    agendaEvents,
    events,
    activities,
    elasticsearch: legacyEventSearch
  } = services;

  log('processing event to member', event.uid, member.id);

  const previousOwnerUid = event.ownerUid;

  await agendaEvents(member.agendaUid).update(event.uid, {
    userUid: member.userUid
  }, { protected: false, transferToLegacy: true });

  await events.update({ uid: event.uid }, {
    ownerUid: member.userUid
  }, { protected: false, transferToLegacy: true });

  try {
    await legacyEventSearch.updateEvent({ uid: event.uid });
  } catch (e) {
    log('error', 'could not update legacy search', event.slug);
  }

  try {
    await feedFollow(activities, false, previousOwnerUid, event.uid);
  } catch (e) {
    log('error', 'failed to update current owner feed', e);
  }

  try {
    await feedFollow(activities, true, member.userUid, event.uid);
  } catch (e) {
    log('error', 'failed to update transferred to user feed', e);
  }
};
