import logs from '@openagenda/logs';
import map from '../databaseFieldMap.js';
import dbMapper from './dbMapper.js';

const dbParse = dbMapper(map);
const log = logs('set');

async function doCreate(knex, schemas, data) {
  if (data.errors.length) {
    log('create will not proceed');

    return data;
  }

  const result = await knex(schemas.agenda).insert(dbParse.toDb(data.clean));

  data.success = !!(result && result[0]);

  if (!data.success) return data;

  log(
    'info',
    'agenda of slug %s, uid %s, id %s successfully created',
    data.clean.slug,
    data.clean.uid,
    result[0],
  );

  [data.id] = result;

  data.identifiers = { id: data.id };

  return data;
}

export default doCreate;
