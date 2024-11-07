import logs from '@openagenda/logs';

import addQuery from './lib/addQuery.js';
import cleanOptions from './lib/cleanOptions.js';

const log = logs('countByLocationUids');

export default async (service, query = {}, o = {}) => {
  log('called', query);
  const { knex } = service.clients;
  const k = service.clients.knex(service.config.schema);
  const options = cleanOptions(o);

  addQuery(k, query, options);

  k.select(knex.raw('count(id) as count, location_uid as locationUid')).groupBy(
    'location_uid',
  );

  const result = await k;
  return result.map((e) => ({ ...e }));
};
