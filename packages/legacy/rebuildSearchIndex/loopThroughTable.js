import _ from 'lodash';

function _buildQuery({ knex, table, field, lastId, query, since }) {
  const k = knex(table)
    .select(field)
    .where(field, '<', lastId)
    .limit(100)
    .orderBy(field, 'desc');

  if (query) k.where(query);

  if (since) k.where('updated_at', '>=', since);

  return k;
}

export default async (knex, table, asyncFn, options = {}) => {
  const { startFromId, query, field, since } = {
    startFromId: 99999999,
    query: null,
    field: 'id',
    since: null,
    ...options,
  };

  let lastId = startFromId;
  let ids;

  while (
    (ids = await _buildQuery({ knex, table, field, lastId, query, since }).then(
      (r) => r.map((r1) => r1[field]),
    )).length
  ) {
    lastId = _.last(ids);

    for (const id of ids) {
      await asyncFn(id);
    }
  }
};
