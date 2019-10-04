'use strict';

const log = require('@openagenda/logs')('Aggregators/dispatch');

const getSourceAndAggregatorPairs = require('../utils/getSourceAndAggregatorPairs');

module.exports = async ({ queue, knex }, action, data) => {
  log('dispatch');
  const { agenda, event } = data;

  const aggregators = await getSourceAndAggregatorPairs(knex, agenda);

  for (const ag of aggregators) {
    if (action === 'evaluate') {
      await queue('evaluate', Object.assign({
        aggregatorAgendaUid: ag.agendaUid,
        sourceRules: ag.sourceRules,
        aggregatorRules: ag.aggregatorRules
      }, data));
    } else {
      await queue('remove', {
        aggregatorAgendaUid: ag.agendaUid,
        sourceAgendaUid: agenda.uid,
        eventUid: event.uid
      });
    }
  }
}
