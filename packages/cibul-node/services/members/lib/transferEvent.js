'use strict';

const log = require('@openagenda/logs')('services/members/transferEvent');

function feedFollow(activities, follow, userUid, eventUid) {
  return activities.feed({
    entityType: 'user',
    entityUid: userUid,
  })[follow ? 'follow' : 'unfollow']({
    entityType: 'event',
    entityUid: eventUid,
  });
}

module.exports = async function transferEvent(services, event, member) {
  const {
    agendaEvents,
    events,
    activities,
  } = services;

  log('processing event to member', event.uid, member.id);

  const previousOwnerUid = event.ownerUid;

  await events.patch({ uid: event.uid }, {
    ownerUid: member.userUid,
  }, { protected: false, transferToLegacy: true, access: 'internal' });

  log('patched event %s to set user %s as its owner', event.uid, member.userUid);

  await agendaEvents(member.agendaUid).update(event.uid, {
    userUid: member.userUid,
  }, { protected: false, transferToLegacy: true });

  log.info('transfered event ownership', {
    agendaUid: member.agendaUid,
    fromUserUid: previousOwnerUid,
    toUserUid: member.userUid,
  });

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
