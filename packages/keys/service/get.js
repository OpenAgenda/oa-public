import _ from 'lodash';
import VError from '@openagenda/verror';
import config from './config.js';
import * as redis from './lib/redis.js';
import validateIdentifiers from './validators/identifiers.js';

function parse(row) {
  if (!row) return row;

  return _.mapKeys(row, (v, k) => _.camelCase(k));
}

export default async (...args) => {
  let identifiers = args[0];
  const options = args[1];
  const params = _.merge(
    {
      cache: false,
      optionalKey: false,
    },
    options,
  );

  const { knex, schemas } = config;

  if (!knex) throw new VError('Db connector needs to be specified at service init');

  try {
    identifiers = _.pickBy(
      validateIdentifiers(identifiers, {
        keyOrIdentifier: true,
        optionalKey: params.optionalKey,
      }),
      (v) => v !== undefined,
    );
  } catch (e) {
    throw new VError(
      {
        name: 'ValidationError',
        info: {
          errors: e,
        },
      },
      'Validation failed',
    );
  }

  let cached;

  if (params.cache && identifiers.key) {
    cached = JSON.parse(await redis.get(identifiers.key));

    if (cached) return cached;
  }

  const row = parse(
    await knex(schemas.key).first().where(identifiers) || null,
  );

  if (params.cache && identifiers.key) {
    await redis.set(identifiers.key, JSON.stringify(row));
  }

  return row;
};
