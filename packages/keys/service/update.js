import _ from 'lodash';
import VError from '@openagenda/verror';
import config from './config.js';
import validateIdentifiers from './validators/identifiers.js';
import validate from './validators/update.js';
import get from './get.js';

export default async (...args) => {
  let [identifiers, data] = args;
  const { knex, schemas } = config;

  if (!knex) throw new VError('Db connector needs to be specified at service init');

  try {
    identifiers = _.pickBy(
      validateIdentifiers(identifiers),
      (v) => v !== undefined,
    );
    data = _.pickBy(validate(data), (v) => v !== undefined);
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

  await knex(schemas.key).where(identifiers).update(data);

  return get(identifiers);
};
