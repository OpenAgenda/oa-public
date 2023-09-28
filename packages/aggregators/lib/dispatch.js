'use strict';

const log = require('@openagenda/logs')('dispatch');

const getSourceAndAggregatorPairs = require('../utils/getSourceAndAggregatorPairs');

const DEFAULT_LIMIT = 365;

module.exports = async ({ queue, knex }, action, data) => {
  log('dispatch');
  const { agenda, event } = data;

  const aggregators = await getSourceAndAggregatorPairs(knex, agenda);
  for (const ag of aggregators) {
    const aggregatorLimit = ag.limit === null ? DEFAULT_LIMIT : ag.limit;

    if (action === 'evaluateEvent') {
      await queue('evaluateEvent', {
        aggregatorAgendaUid: ag.agendaUid,
        sourceRules: ag.sourceRules,
        aggregatorRules: ag.aggregatorRules,
        aggregatorLimit,
        ...data,
      });
    } else {
      await queue('removeEvent', {
        aggregatorAgendaUid: ag.agendaUid,
        sourceAgendaUid: agenda.uid,
        eventUid: event.uid,
        ...data,
      });
    }
  }
};
