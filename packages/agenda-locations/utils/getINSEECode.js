'use strict';

const { promisify } = require('util');
const _ = require('lodash');
const slug = require('slugify');
const sa = require('superagent');

const NS = 'insee';

const getKey = ({ city, department }) => [
  slug(department, { lower: true, strict: true }),
  slug(city, { lower: true, strict: true }),
].join('|');

const res = ({ latitude, longitude }) => `https://geo.api.gouv.fr/communes?lat=${latitude}&lon=${longitude}`;

const format = body => _.get(_.first(body), 'code');

module.exports = redisClient => {
  const cache = {
    get: promisify(redisClient.hget.bind(redisClient, NS)),
    set: promisify(redisClient.hset.bind(redisClient, NS)),
  };

  return async ({
    city, department, latitude, longitude
  }) => {
    const cached = await cache.get(getKey({ city, department }));

    if (cached) {
      return format(JSON.parse(cached));
    }

    const { body } = await sa.get(res({ latitude, longitude }));

    cache.set(getKey({ city, department }), JSON.stringify(body));

    return format(body);
  };
};
