import logs from '@openagenda/logs';
import getSourceAndAggregatorPairs from '../utils/getSourceAndAggregatorPairs.js';

const log = logs('dispatch');

const DEFAULT_LIMIT = 365;

export default async ({ queue, knex }, action, data) => {
  log('dispatch');
  const { agenda } = data;

  const aggregatorsBuffer = (
    await getSourceAndAggregatorPairs(knex, agenda)
  ).map((ag) => {
    if (action === 'evaluateEvent') {
      return {
        aggregatorLimit: ag.limit === null ? DEFAULT_LIMIT : ag.limit,
        aggregatorAgendaUid: ag.agendaUid,
        sourceRules: ag.sourceRules,
        aggregatorRules: ag.aggregatorRules,
      };
    }
    return {
      aggregatorAgendaUid: ag.agendaUid,
    };
  });

  await queue.add(action, {
    aggregatorsBuffer,
    sourceAgendaUid: agenda.uid,
    ...data,
  });
};
