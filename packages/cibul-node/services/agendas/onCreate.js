'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('services/agendas/onCreate');

module.exports = async (services, agenda) => {
  const {
    members,
    users: usersSvc,
    legacy,
    keys,
    activities,
    inboxes: { Inbox },
    eventSearch,
    agendaSearch,
    discord
  } = services;

  const controlDataSvc = legacy.controlData;

  // inbox
  try {
    log('create inbox (agenda uid %d)', agenda.uid);
    await new Inbox().create({
      type: 'agenda',
      identifier: agenda.uid
    });
  } catch (e) {
    log('error', 'failed to create agenda inbox', e);
  }

  let agendaFeed;

  // feed / activity
  try {
    agendaFeed = await activities.feed({
      entityType: 'agenda',
      entityUid: agenda.uid
    }).create();
  } catch(e) {
    log('error', 'failed to created agenda feed', e);
  }

  const user = await usersSvc.findOne({
    query: {
      id: agenda.ownerId
    }
  });

  if (user.isNew) {
    await usersSvc.setNewFlag(user.uid, { isNew: false });
  }

  try {
    await controlDataSvc.rebuild( agenda.uid );
    await controlDataSvc.memberSet({
      agendaUid: agenda.uid,
      userUid: user.uid,
      role: 2
    });
  } catch (e) {
    log('error', 'failed to set agenda control data', e);
  }

  const { member } = await members.create({
    agendaUid: agenda.uid,
    userUid: user.uid,
    role: 2
  }, { requireCustom: false }).catch(e => {
    if (e) log('error', 'failed to create member');
    throw e;
  });

  if (agendaFeed) {
    try {
      await activities.feed(agendaFeed).activities.add({
        actor: `user:${user.uid}`,
        verb: 'agenda.create',
        target: `agenda:${agenda.uid}`,
        store: {
          labels: {
            actor: user.fullName,
            target: agenda.title
          }
        }
      });
    } catch (e) {
      log('error', 'failed to create agenda create activity', e);
    }
  }

  if (agenda.indexed) {
    try {
      await agendaSearch.set(agenda);
    } catch (e) {
      log('error', 'failed to index agenda in agenda search', e);
    }
  }

  try {
    await keys({
      type: 'agendaFullRead',
      identifier: agenda.uid
    }).create();
  } catch (e) {
    log('error', 'failed to create agenda key', e);
  }

  try {
    await eventSearch.agendas(agenda).rebuild();
  } catch (e) {
    log('error', 'failed to create agenda index');
  }

  try {
    await discord.notifyAgendaCreation(agenda, user);
  } catch (e) {
    log('error', 'failed to notify discord %s', e);
  }

  log('done');
}
