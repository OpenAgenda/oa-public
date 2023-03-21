'use strict';

const { promisify } = require('util');
const _ = require('lodash');
const express = require('express');
const VError = require('@openagenda/verror');

async function saveExpiration(delay, req, res) {
  const {
    sanitizedUrl,
    ttl
  } = req.cache;

  const cacheTtl = await ttl(sanitizedUrl);
  const expires = new Date(Date.now() + cacheTtl * 1000);

  res.cacheDelay = delay;
  res.cacheTtl = cacheTtl;
  res.cacheExpires = expires;
}

module.exports = (namespace, path, delay, mwIfNoCache) => {
  const cacheRouter = express.Router({ mergeParams: true })
    .use(mwIfNoCache)
    .use(saveToCache(namespace, delay));

  return async (req, res, next) => {
    const { simpleCache } = req.app.services;

    const identifier = _.get(req, path);
    const sanitizedUrl = _sanitizeUrl(req);

    req.cache = {
      identifier,
      sanitizedUrl,
      get: promisify(simpleCache(namespace, identifier).get),
      set: promisify(simpleCache(namespace, identifier).set),
      ttl: promisify(simpleCache(namespace, identifier).ttl)
    };

    try {
      const cached = await req.cache.get(sanitizedUrl);

      if (cached) {
        req.log.info({
          cached: `${namespace}:${identifier}`,
          message: 'cached response'
        });

        try {
          res.data = JSON.parse(cached);
        } catch (e) {
          throw new VError(e, 'failed to parse cached data at %s:%s - %s', namespace, identifier, cached);
        }

        await saveExpiration(delay, req, res);

        next();
      } else {
        cacheRouter(req, res, next);
      }
    } catch (e) {
      req.log.error({
        cached: `${namespace}:${identifier}`,
        error: e,
        message: 'caching error'
      });

      next(e);
    }
  };
};

function saveToCache(namespace, delay) {
  return async (req, res, next) => {
    if (!res.data) {
      return next();
    }

    const {
      identifier,
      sanitizedUrl,
      set
    } = req.cache;

    try {
      await set(sanitizedUrl, JSON.stringify(res.data), delay);

      req.log.info({
        cached: `${namespace}:${identifier}`,
        message: 'caching successful'
      });

      await saveExpiration(delay, req, res);

      next();
    } catch (e) {
      req.log.error({
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
