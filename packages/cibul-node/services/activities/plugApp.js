import logs from '@openagenda/logs';
import cmn from '../../lib/commons-app.js';
import listMiddleware from './middleware/list.js';

const log = logs('services/activites/plugApp');

function activitiesGet(activitiesSvc, req, res) {
  activitiesSvc.activities
    .get(req.params.id)
    .then((activity) => {
      res.json({ activity });
    })
    .catch((err) => {
      res.status(400).json({ error: err });
    });
}

function notificationsCount(activitiesSvc, req, res) {
  activitiesSvc
    .feed({
      entityType: 'user',
      entityUid: req.user.uid,
    })
    .notifications.count({ state: 0 })
    .then((counter) => {
      res.json({ counter });
    })
    .catch((err) => {
      res.status(400).json({ error: err });
    });
}

function notificationsList(activitiesSvc, req, res) {
  const limit = req.query.justOne ? 1 : 5;

  activitiesSvc
    .feed({
      entityType: 'user',
      entityUid: req.user.uid,
    })
    .notifications.list(req.query.fromId, limit)
    .then(async (notifications) => {
      await activitiesSvc
        .feed({
          entityType: 'user',
          entityUid: req.user.uid,
        })
        .notifications.markAs({}, 1, {
          allowRegress: false,
          listArgs: [0, 10000],
        });

      return activitiesSvc
        .feed({
          entityType: 'user',
          entityUid: req.user.uid,
        })
        .notifications.count({ state: 0 })
        .then((counter) => {
          res.json({
            counter,
            notifications,
            lastPage: notifications.length < limit,
          });
        });
    })
    .catch((err) => {
      log('error', err);
      console.log('error', err);

      res.status(400).json({ error: err });
    });
}

function notificationsMarkRead(activitiesSvc, req, res) {
  activitiesSvc
    .feed({
      entityType: 'user',
      entityUid: req.user.uid,
    })
    .notifications.markAs({ ids: [req.params.notifId] }, 2)
    .then((notifications) => {
      res.json({
        notification: notifications.length ? notifications[0] : null,
      });
    })
    .catch((err) => {
      res.status(400).json({ error: err });
    });
}

async function notificationsMarkAllRead(activitiesSvc, req, res) {
  let rowsCount = 0;
  let rowsAffected = 0;
  let fromId;

  try {
    while (rowsCount > 0) {
      const notifs = await activitiesSvc
        .feed({
          entityType: 'user',
          entityUid: req.user.uid,
        })
        .notifications.list({ stateNot: 2 }, fromId, 100);

      rowsCount = notifs.length;
      rowsAffected += notifs.length;

      if (!notifs.length) {
        break;
      }

      /* fromId = _.last(notifs).id; */
      fromId = notifs[notifs.length - 1].id;

      await activitiesSvc
        .feed({
          entityType: 'user',
          entityUid: req.user.uid,
        })
        .notifications.markAs({ ids: notifs.map((v) => v.id) }, 2);
    }
  } catch (err) {
    res.status(400).json({ error: err });
    return;
  }

  res.json({ rowsAffected });
}

function notificationsRemove(activitiesSvc, req, res) {
  activitiesSvc
    .feed({
      entityType: 'user',
      entityUid: req.user.uid,
    })
    .notifications.remove({ ids: [req.params.notifId] })
    .then((notifications) => {
      res.json({
        notification: notifications.length ? notifications[0] : null,
      });
    })
    .catch((err) => {
      res.status(400).json({ error: err });
    });
}

export default function plugApp(app) {
  const { sessions, activities, agendas, members } = app.services;
  const preMw = [
    sessions.mw.ifUnlogged((req, res) =>
      res.status(400).json({ error: 'Not logged' })),
  ];

  app.get(
    '/:agendaSlug/admin/activities/list',
    cmn.loadLogger('agendaActivities'),
    sessions.mw.ifUnlogged((req, res) => res.redirect(302, '/')),
    agendas.mw.load,
    agendas.mw.authorizeByIPAddress(),
    members.mw.loadAndAuthorize('moderator'),
    (req, res) =>
      listMiddleware(activities, {
        entityType: 'agenda',
        entityUid: req.agenda.uid,
      })(req, res),
  );

  app.get('/activities/:id', preMw, activitiesGet.bind(null, activities));

  app.get(
    '/notifications/count',
    preMw,
    notificationsCount.bind(null, activities),
  );
  app.get(
    '/notifications/list',
    preMw,
    notificationsList.bind(null, activities),
  );
  app.get(
    '/notifications/remove/:notifId',
    preMw,
    notificationsRemove.bind(null, activities),
  );
  app.get(
    '/notifications/mark-read/:notifId',
    preMw,
    notificationsMarkRead.bind(null, activities),
  );
  app.get(
    '/notifications/mark-all-read',
    preMw,
    notificationsMarkAllRead.bind(null, activities),
  );
}
