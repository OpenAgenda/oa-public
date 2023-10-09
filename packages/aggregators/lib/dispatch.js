'use strict';

const log = require('@openagenda/logs')('dispatch');

const getSourceAndAggregatorPairs = require('../utils/getSourceAndAggregatorPairs');

const DEFAULT_LIMIT = 365;

module.exports = async ({ queue, knex }, action, data) => {
  log('dispatch');
  const { agenda } = data;

  const aggregatorsBuffer = (
    await getSourceAndAggregatorPairs(knex, agenda)
  ).map(ag => {
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

  await queue(action, {
    aggregatorsBuffer,
    sourceAgendaUid: agenda.uid,
    ...data,
  });
};
