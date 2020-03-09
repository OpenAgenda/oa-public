'use strict';

const log = require('@openagenda/logs')('events/interfaces/onCreate');

module.exports = (services, event, context) => {
  services.tracker('events.onCreate');
  log('info', 'created event %s with context %j', event.uid, context);

  if (event.creatorUid) {
    _unsetNewUser(services.users, event);
  }

  _registerActivity(services.activities, event);
}

async function _registerActivity(activitiesSvc, event) {
  try {
    await activitiesSvc.feed({
      entityType: 'event',
      entityUid: event.uid,
    }).create();
  } catch (err) {
    log('error', err);
  }
}

function _unsetNewUser(usersSvc, event) {
  usersSvc.get(event.creatorUid)
    .then(async user => {
      if (user && user.isNew) {
        await usersSvc.setNewFlag(event.creatorUid, { isNew: false });
      }
    })
    .catch(err => {
      log('error', err);
    });
}
