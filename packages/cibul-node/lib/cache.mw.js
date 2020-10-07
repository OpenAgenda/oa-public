'use strict';

const { promisify } = require('util');
const _ = require('lodash');
const express = require('express');

async function saveExpiration(ttl, sanitizedUrl, delay, res) {
  const cacheTtl = await ttl(sanitizedUrl);
  const expires = new Date(Date.now() + cacheTtl * 1000);

  res.cacheDelay = delay;
  res.cacheTtl = cacheTtl;
  res.cacheExpires = expires;
}

module.exports = (namespace, path, delay, cacheMw) => {
  const cacheRouter = express.Router({ mergeParams: true }).use(cacheMw);

  return async (req, res, next) => {
    const { simpleCache } = req.app.services;

    const identifier = _.get(req, path);
    const sanitizedUrl = _sanitizeUrl(req);

    const cache = {
      get: promisify(simpleCache(namespace, identifier).get),
      set: promisify(simpleCache(namespace, identifier).set),
      ttl: promisify(simpleCache(namespace, identifier).ttl),
    };

    try {
      const cached = await cache.get(sanitizedUrl);

      if (cached) {
        req.log('info', {
          cached: `${namespace}:${identifier}`,
          message: `cached response`
        });

        res.data = JSON.parse(cached);

        await saveExpiration(cache.ttl, sanitizedUrl, delay, res);

        next();
      } else {
        cacheRouter.use(saveToCache(cache, namespace, identifier, sanitizedUrl, delay));

        cacheRouter(req, res, next);
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

function saveToCache(cache, namespace, identifier, sanitizedUrl, delay) {
  return async (req, res, next) => {
    try {
      await cache.set(sanitizedUrl, JSON.stringify(res.data), delay);

      req.log('info', {
        cached: `${namespace}:${identifier}`,
        message: 'caching successful'
      });
      await saveExpiration(cache.ttl, sanitizedUrl, delay, res);

      next();
    } catch (e) {
      req.log('error', {
        cached: `${namespace}:${identifier}`,
        error: e,
        message: 'caching error'
      });

      next(e);
    }
  }
}

/**
 * remove the bits irrelevant for cache key
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
