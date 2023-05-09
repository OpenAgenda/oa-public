"use strict";

const logs = require('@openagenda/logs');
const cmn = require('../../lib/commons-app');

const ANNOUNCEMENT_KEY = 'oa:announcement';

const log = logs('services/supervisor/announcements');

module.exports = {
  init,
  plugApp
};

function init(config, services) {
  return new Announcements({
    redisClient: services.redis,
  });
}

function plugApp(app, base = '/announcement') {
  const { sessions, supervisor: { announcements } } = app.services;

  app.post(
    base,
    sessions.mw.ifUnlogged(cmn.redirectToSignin),
    sessions.mw.requireSuperAdmin,
    async (req, res, next) => {
      try {
        await announcements.set(req.body);
        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    }
  );

  app.delete(
    base,
    sessions.mw.ifUnlogged(cmn.redirectToSignin),
    sessions.mw.requireSuperAdmin,
    async (req, res, next) => {
      try {
        await announcements.remove();
        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    }
  );
}

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
