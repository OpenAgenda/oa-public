import uuid from 'uuid';
import VError from '@openagenda/verror';
import config from './config.js';
import get from './get.js';
import validateIdentifiers from './validators/identifiers.js';
import validate from './validators/create.js';

async function getUuid() {
  const MAX_TRIES = 100;

  for (let i = 0; i < MAX_TRIES; i++) {
    const key = uuid().replace(/-/g, '');

    const existing = await config
      .knex(config.schemas.key)
      .where('key', key)
      .first();

    if (!existing) {
      return key;
    }
  }

  throw new Error(
    `Unable to generate a unique key after ${MAX_TRIES} attempts.`,
  );
}

export default async (...args) => {
  let [identifiers, data] = args;
  const { knex, schemas } = config;

  if (!knex) throw new VError('db connector needs to be specified at service init');

  try {
    identifiers = validateIdentifiers(identifiers, {
      allowId: false,
      optionalKey: true,
    });
    data = validate(data);
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

  let insertId;

  try {
    insertId = await knex(schemas.key).insert({
      ...identifiers,
      label: data.label,
      key: await getUuid(),
      created_at: new Date(),
    });
  } catch (e) {
    throw new VError(
      e,
      `could not insert for ${identifiers.id}`
        || `${identifiers.type} / ${identifiers.identifier}`,
    );
  }

  return get(insertId[0]);
};
