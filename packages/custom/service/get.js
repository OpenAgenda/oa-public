import VError from '@openagenda/verror';
import logs from '@openagenda/logs';
import config from './config.js';

const log = logs('get');

export default async (formSchemaId, identifier) => {
  const { knex, schemas } = config;

  if (!knex) throw new Error('db connector needs to be specified at service init');

  log('info', 'getting %s.%s', formSchemaId, identifier);

  const data = await knex(schemas.custom).first().where({
    form_schema_id: formSchemaId,
    identifier,
  });

  if (!data) return null;

  try {
    return JSON.parse(data.store);
  } catch (e) {
    throw new VError(
      e,
      'could not parse custom data record %s: %s',
      formSchemaId,
      identifier,
    );
  }
};
