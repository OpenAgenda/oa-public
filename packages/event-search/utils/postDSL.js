import { BadRequest, GeneralError } from '@openagenda/verror';

import logs from '@openagenda/logs';
import includeSortValues from './includeSortValues.js';

const log = logs('postDSL');

const hasFailure = (body, type) =>
  !!(body._shards.failures ?? []).find(({ reason }) => reason.type === type);

export default async function postDSL({ client }, index, DSL, options = {}) {
  const { includeSort = false } = options;
  const res = await client.search({
    index,
    body: DSL,
  });

  if (hasFailure(res.body, 'too_many_buckets_exception')) {
    throw new BadRequest('Too many aggregations requested');
  }

  if (`${res.statusCode}`[0] !== '2') {
    log.error('elasticsearch error', res);
    throw new GeneralError(
      {
        info: res,
      },
      'Elasticsearch error',
    );
  }
  return {
    events: includeSort
      ? res.body.hits.hits.map((h) => ({
        ...h._source,
        sort: includeSortValues(DSL, h.sort),
      }))
      : res.body.hits.hits.map((h) => h._source),
    total: res.body.hits.total.value,
    sort:
      DSL.sort && res.body.hits.hits.length
        ? res.body.hits.hits[res.body.hits.hits.length - 1].sort
        : null,
    ...DSL.aggregations
      ? {
        aggregations: res.body.aggregations,
      }
      : {},
  };
}
