import logs from '@openagenda/logs';

const log = logs('events/interfaces/onCreate');

function unsetNewUser(usersSvc, event) {
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

async function registerActivity(activitiesSvc, event) {
  if (!activitiesSvc) {
    log('warn', 'activities services was not initialized');
    return;
  }

  try {
    await activitiesSvc.feed({
      entityType: 'event',
      entityUid: event.uid,
    }).create();
  } catch (err) {
    log('error', err);
  }
}

export default (services, event, context) => {
  services.tracker('events.onCreate');
  log('info', 'created event %s with context %j', event.uid, context);

  if (event.creatorUid) {
    unsetNewUser(services.users, event);
  }

  registerActivity(services.activities, event);
};
