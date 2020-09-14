'use strict';

const { promisify } = require('util');
const _ = require('lodash');
const express = require('express');

module.exports = (namespace, path, delay, cacheMw) => {
  const cacheRouter = express.Router({ mergeParams: true }).use(cacheMw);

  return async (req, res, next) => {
    const { simpleCache } = req.app.services;

    const identifier = _.get(req, path);
    const get = promisify(simpleCache(namespace, identifier).get);
    const set = promisify(simpleCache(namespace, identifier).set);
    const ttl = promisify(simpleCache(namespace, identifier).ttl);
    const sanitizedUrl = _sanitizeUrl(req);

    async function saveExpiration() {
      const cacheTtl = await ttl(sanitizedUrl);
      const expires = new Date(Date.now() + cacheTtl * 1000);

      res.cacheDelay = delay;
      res.cacheTtl = cacheTtl;
      res.cacheExpires = expires;
    }

    try {
      const cached = await get(sanitizedUrl);

      if (cached) {
        req.log('info', {
          cached: `${namespace}:${identifier}`,
          message: `cached response`
        });

        res.data = JSON.parse(cached);

        await saveExpiration();

        next();
      } else {
        cacheRouter(req, res, async () => {
          try {
            await set(sanitizedUrl, JSON.stringify(res.data), delay);

            req.log('info', {
              cached: `${namespace}:${identifier}`,
              message: 'caching successful'
            });
            await saveExpiration();

            next();
          } catch (e) {
            req.log('error', {
              cached: `${namespace}:${identifier}`,
              error: e,
              message: 'caching error'
            });

            next(e);
          }
        });
      }
    } catch (e) {
      req.log('error', {
        cached: `${namespace}:${identifier}`,
        error: e,
        message: 'caching error'
      });

      next(e);
    }
  };
}

/**
 * remove the bits irrelevent for cache key
 */
function _sanitizeUrl(req) {
  if (req.url.indexOf('?') === -1) return req.url;

  const parts = req.url.split('?');

  return [
    parts[0],
    parts[1].split('&')
      .map(qPart => qPart.split('='))
      .filter(kv => !['key', 'callback', '_'].includes(kv[0]))
      .map(kv => kv.join('='))
      .join('&')
  ].join('?');
}
