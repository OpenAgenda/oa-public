import VError from '@openagenda/verror';
import config from './config.js';
import get from './get.js';

export default async (identifiers) => {
  const { knex, schemas } = config;

  if (!knex) throw new VError('Db connector needs to be specified at service init');

  const row = await get(identifiers, { optionalKey: true });

  if (row) {
    const result = await knex(schemas.key).delete().where({ id: row.id });

    if (config.interfaces?.onRemove) {
      await config.interfaces.onRemove(row);
    }

    return result;
  }

  return null;
};
