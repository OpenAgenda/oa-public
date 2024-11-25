import _ from 'lodash';
import VError from '@openagenda/verror';

export default async ({ knex, schema }) => {
  if (!knex) throw new VError('service is not initialized');

  return (await knex(schema)).map((n) =>
    _.mapKeys(n, (v, k) => _.camelCase(k)));
};
