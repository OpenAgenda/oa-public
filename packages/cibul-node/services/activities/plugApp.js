import logs from '@openagenda/logs';
import mw from '@openagenda/activity-apps/dist/middleware.js';

const log = logs('services/activites/plugApp');

/* function list(activitiesSvc, options, preQuery = {}) {
  return (req, res) => {
    const query = { ...preQuery, ...req.query };
    const listQuery = _.pick(query, ['actor', 'verb', 'object', 'target']);
    const { limit } = config;

    const { datetimeRange, fromId } = query;

    if (datetimeRange) {
      const [afterAt, beforeAt] = datetimeRange.split('|');
      query.createdAt = {
        $lte: new Date(beforeAt),
        $gte: new Date(afterAt),
      };
    }

    const svc = options ? activitiesSvc.feed(options) : activitiesSvc;

    svc.activities
      .list(listQuery, fromId || 0, limit)
      .then((activities) => {
        res.send({ activities });
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  };
} */

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

/* function notificationsMarkRead(activitiesSvc, req, res) {
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
} */

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
  const { sessions, activities } = app.services;
  const preMw = [
    sessions.mw.ifUnlogged((req, res) =>
      res.status(400).json({ error: 'Not logged' })),
  ];

  app.get('/:slug/admin/activities/list', preMw, (req, res) =>
    mw.list({ entityType: 'agenda', entityUid: req.agenda.uid })(req, res));

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
    mw.notifications.markRead,
  );
  app.get(
    '/notifications/mark-all-read',
    preMw,
    notificationsMarkAllRead.bind(null, activities),
  );
}

/* module.exports = {
  list,
  notifications: {
    count: notificationsCount,
    list: notificationsList,
    markRead: notificationsMarkRead,
    markAllRead: notificationsMarkAllRead,
    remove: notificationsRemove,
  },
}; */
