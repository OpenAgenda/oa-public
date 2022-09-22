'use strict';

const VError = require('verror');
const log = require('@openagenda/logs')('agendaEvents/beforeRemove');
const controlDataSvc = require('../legacy').controlData;
const fallbackContextGet = require('./lib/fallbackContextGet');

module.exports = async ({ services }, ae, context) => {
  const {
    activities,
  } = services;

  log('will remove agenda-event %j', ae, { context });

  const { agenda, event, user } = await fallbackContextGet({ services }, 'beforeRemove', ae, context);

  if (ae.state === 2) {
    try {
      await controlDataSvc.remove(ae);
    } catch (e) {
      log('error', 'control data remove failed', e);
    }
  }

  if (!agenda || !event) {
    return log('error', new VError({
      info: { user, agenda, event },
    }, 'An entity is missing for add activity'));
  }

  try {
    if (context.deletion) {
      if (agenda.uid === event.agendaUid) {
        await activities.feed({ entityType: 'event', entityUid: event.uid }).activities.add({
          actor: `user:${user.uid}`,
          verb: 'event.delete',
          object: `event:${event.uid}`,
          target: `agenda:${agenda.uid}`,
          store: {
            labels: {
              actor: user.name,
              object: event.title,
              target: agenda.title,
            },
          },
        });
      } else {
        await activities.feed({ entityType: 'event', entityUid: event.uid }).activities.add({
          actor: `agenda:${agenda.uid}`,
          verb: 'agenda.removeDeletedEvent',
          object: `event:${event.uid}`,
          target: `agenda:${agenda.uid}`,
          store: {
            contributorUid: ae.userUid,
            labels: {
              object: event.title,
              target: agenda.title,
            },
          },
        });
      }
    } else if (user) {
      await activities.feed({ entityType: 'event', entityUid: event.uid }).activities.add({
        actor: `user:${user.uid}`,
        verb: 'agenda.removeEvent',
        object: `event:${event.uid}`,
        target: `agenda:${agenda.uid}`,
        store: {
          state: ae.state,
          ownerUid: event.ownerUid,
          originAgendaUid: event.agendaUid,
          sourceAgendaUids: ae.sourcePaths.map(v => v[v.length - 1]),
          labels: {
            actor: user.name,
            object: event.title,
            target: agenda.title,
          },
        },
      });
    } else {
      await activities.feed({ entityType: 'event', entityUid: event.uid }).activities.add({
        actor: `agenda:${agenda.uid}`,
        verb: 'agenda.systemRemoveEvent',
        object: `event:${event.uid}`,
        target: `agenda:${agenda.uid}`,
        store: {
          contributorUid: ae.userUid,
          labels: {
            object: event.title,
            target: agenda.title,
          },
        },
      });
    }
  } catch (err) {
    if (err) {
      log('error', 'Error to add activity event.delete, agenda.removeEvent, agenda.removeDeletedEvent or agenda.systemRemoveEvent in feed event:%s', event.uid, err);
    }
  }

  try {
    await activities.feed({ entityType: 'agenda', entityUid: agenda.uid })
      .unfollow({ entityType: 'event', entityUid: event.uid });
  } catch (err) {
    if (err) {
      log('error',
        'Error when feed agenda:%s have tried to unfollow feed event:%s', agenda.uid, event.uid,);
    }
  }
};
