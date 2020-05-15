"use strict";

const { promisify } = require('util');
const cmn = require('../../lib/commons-app');

const ANNOUNCEMENT_KEY = 'oa:announcement';

module.exports = {
  init,
  plugApp
};

function init(config) {
  return new Announcements({
    redisClient: config.redisClient
  });
}

function plugApp(app, base = '/supervisor/announcement') {
  const { sessions, announcements } = app.services;

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
    this.redisClient = new Proxy(config.redisClient, {
      get(target, propKey) {
        if (typeof target[propKey] === 'function') {
          return promisify(target[propKey]).bind(target);
        }
        return target[propKey];
      },
    })
  }

  async set(data) {
    return this.redisClient.set(ANNOUNCEMENT_KEY, JSON.stringify(data));
  }

  async get() {
    const announcement = await this.redisClient.get(ANNOUNCEMENT_KEY);

    return announcement ? JSON.parse(announcement) : announcement;
  }

  async remove() {
    return this.redisClient.del(ANNOUNCEMENT_KEY);
  }
}
