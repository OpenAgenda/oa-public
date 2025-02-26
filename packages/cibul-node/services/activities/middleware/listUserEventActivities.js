import logs from '@openagenda/logs';
import { NotAuthenticated } from '@openagenda/verror';

const log = logs('services/activities/middleware/listUserEventActivities');

export default async function listUserEventActivities(req, res, next) {
  const { activities: activitiesSvc } = req.app.services;

  const { size = 20, after = 0, withConfig } = req.query;

  if (!req.user) {
    return next(new NotAuthenticated('Authentication is required'));
  }

  const config = withConfig === '1' ? activitiesSvc.getFormatConfig() : null;

  const feed = activitiesSvc.feed({
    entityType: 'user',
    entityUid: req.user.uid,
  });

  if (!await feed.get()) {
    log('no feed for user', { userUID: req.user.uid });
    return res.json({
      activities: [],
      after: null,
    });
  }

  const activities = await feed.activities.list(
    {
      object: `event:${req.event.uid}`,
    },
    after,
    size,
  );

  log('fetched %s activities', activities.length);

  res.json({
    activities,
    after:
      activities.length < size ? null : activities[activities.length - 1].id,
    ...config ? { config } : {},
  });
}
