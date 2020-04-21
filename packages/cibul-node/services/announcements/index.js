"use strict";

const { promisify } = require('util');
const cmn = require('../../lib/commons-app');

const ANNOUNCEMENT_KEY = 'oa:announcement';
let service;

module.exports = {
  init,
  plugApp
};

function init(config) {
  service = new Announcements({
    redisClient: config.redisClient
  });

  return service;
}

function plugApp(app) {
  const { sessions } = app.services;

  app.post(
    '/supervisor/announcement',
    sessions.middleware.ifUnlogged(cmn.redirectToSignin),
    cmn.requireSuperAdmin,
    async (req, res, next) => {
      try {
        await service.set(req.body);
        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    }
  );

  app.delete(
    '/supervisor/announcement',
    sessions.middleware.ifUnlogged(cmn.redirectToSignin),
    cmn.requireSuperAdmin,
    async (req, res, next) => {
      try {
        await service.remove();
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
