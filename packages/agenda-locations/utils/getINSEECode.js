'use strict';

const _ = require('lodash');
const slug = require('slugify');

const NS = 'insee';

const getKey = ({ city, department }) =>
  [
    slug(department, { lower: true, strict: true }),
    slug(city, { lower: true, strict: true }),
  ].join('|');

const res = ({ latitude, longitude }) =>
  `https://geo.api.gouv.fr/communes?lat=${latitude}&lon=${longitude}`;

const format = (body) => _.get(_.first(body), 'code');

module.exports = (redisClient) =>
  async ({ city, department, latitude, longitude }) => {
    const cached = await redisClient.hGet(NS, getKey({ city, department }));

    if (cached) {
      return format(JSON.parse(cached));
    }

    const response = await fetch(res({ latitude, longitude }));
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const body = await response.json();

    redisClient.hSet(NS, getKey({ city, department }), JSON.stringify(body));

    return format(body);
  };
