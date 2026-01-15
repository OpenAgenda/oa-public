import logs from '@openagenda/logs';
import map from '../databaseFieldMap.js';
import dbMapper from './dbMapper.js';

const dbParse = dbMapper(map);
const log = logs('set');

async function doUpdate(knex, schemas, data) {
  if (data.errors.length) return data;

  const affected = await knex(schemas.agenda)
    .where({
      id: data.id,
    })
    .update(dbParse.toDb(data.clean));

  data.success = !!affected;

  if (data.success) {
    log('info', 'updated agenda %s', data.id);
  }

  return data;
}

export default doUpdate;
