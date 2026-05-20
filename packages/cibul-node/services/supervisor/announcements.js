import logs from '@openagenda/logs';
import { requireUser } from '../../lib/authGuards.js';

const ANNOUNCEMENT_KEY = 'oa:announcement';

const log = logs('services/supervisor/announcements');

class Announcements {
  constructor(config) {
    this.redisClient = config.redisClient;
  }

  async set(data) {
    log('setting');
    return this.redisClient.set(ANNOUNCEMENT_KEY, JSON.stringify(data));
  }

  async get() {
    log('getting');
    const announcement = await this.redisClient.get(ANNOUNCEMENT_KEY);

    return announcement ? JSON.parse(announcement) : announcement;
  }

  async remove() {
    log('removing');
    return this.redisClient.del(ANNOUNCEMENT_KEY);
  }
}

export function init(config, services) {
  return new Announcements({
    redisClient: services.redis,
  });
}

export function plugApp(app, base = '/announcement') {
  const {
    supervisor: { announcements },
    users,
  } = app.services;

  app.post(
    base,
    requireUser,
    users.mw.allowSuperAdmin(),
    async (req, res, next) => {
      try {
        await announcements.set(req.body);
        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    },
  );

  app.delete(
    base,
    requireUser,
    users.mw.allowSuperAdmin(),
    async (req, res, next) => {
      try {
        await announcements.remove();
        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    },
  );
}
