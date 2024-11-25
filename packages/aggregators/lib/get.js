import * as db from '../utils/db.js';
import getAgendaId from '../utils/getAgendaId.js';
import * as limit from '../utils/limit.js';

export default async (
  { knex, getAggregatedCount },
  agendaUid,
  options = {},
) => {
  const { detailed } = {
    detailed: false,
    ...options,
  };

  const agendaId = await getAgendaId(knex, agendaUid);

  if (!agendaId) {
    throw new Error('Agenda not found');
  }

  const aggregator = await knex('aggregator')
    .first('*')
    .where('review_id', agendaId)
    .then((r) => (r ? db.fromEntry(r) : null));

  if (!aggregator || !detailed) {
    return aggregator;
  }

  const aggregatedCount = await getAggregatedCount(agendaUid);

  return {
    ...aggregator,
    aggregatedCount,
    limitIsReached: limit.isReached(aggregator.limit, aggregatedCount),
  };
};
