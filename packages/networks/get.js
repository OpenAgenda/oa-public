import _ from 'lodash';
import VError from '@openagenda/verror';

export default async ({ knex, schema }, uid) => {
  if (!knex) throw new VError('service is not initialized');

  const fetched = await knex(schema)
    .first(['form_schema_id', 'title'])
    .where('uid', uid);

  if (!fetched) return null;

  return _.assign(
    { uid },
    _.mapKeys(fetched, (v, k) => _.camelCase(k)),
  );
};
