import logs from '@openagenda/logs';
import getAgendaId from '../utils/getAgendaId.js';
import aggregatorExists from '../utils/aggregatorExists.js';

const log = logs('aggregators/remove');

export default async (knex, agendaUid) => {
  const logBundle = { agenda: { uid: agendaUid } };

  log.info('processing', logBundle);
  const agendaId = await getAgendaId(knex, agendaUid);
  const exists = await aggregatorExists(knex, agendaId);

  if (!exists) {
    log('aggregator not found, throwing error', logBundle);
    throw new Error('Aggregator not found');
  }

  const result = await knex('aggregator').delete().where({
    review_id: agendaId,
  });

  const success = result === 1;

  log(success ? 'success' : 'failed', logBundle);

  return {
    success,
  };
};
