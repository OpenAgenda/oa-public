'use strict';

const _ = require('lodash');
const VError = require('@openagenda/verror');
const config = require('./config');
const redis = require('./lib/redis');
const validateIdentifiers = require('./validators/identifiers');

module.exports = async (identifiers, options) => {
  const params = _.merge(
    {
      cache: false,
      optionalKey: false,
    },
    options
  );

  const { knex, schemas } = config;

  if (!knex)
    throw new VError('Db connector needs to be specified at service init');

  try {
    identifiers = _.pickBy(
      validateIdentifiers(identifiers, {
        keyOrIdentifier: true,
        optionalKey: params.optionalKey,
      }),
      (v) => v !== undefined
    );
  } catch (e) {
    throw new VError(
      {
        name: 'ValidationError',
        info: {
          errors: e,
        },
      },
      'Validation failed'
    );
  }

  let cached;

  if (params.cache && identifiers.key) {
    cached = JSON.parse(await redis.get(identifiers.key));

    if (cached) return cached;
  }

  const row = parse(
    (await knex(schemas.key).first().where(identifiers)) || null
  );

  if (params.cache && identifiers.key) {
    await redis.set(identifiers.key, JSON.stringify(row));
  }

  return row;
};

function parse(row) {
  if (!row) return row;

  return _.mapKeys(row, (v, k) => _.camelCase(k));
}
