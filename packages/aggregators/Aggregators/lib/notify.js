'use strict';

const log = require('@openagenda/logs')('Aggregators/notify');

const determineAggregationAction = require('../utils/determineAggregationAction');

module.exports = async ({
  isAgendaSource,
  queue
}, type, data, options = {}) => {
  const { agenda } = data;
  // add, remove, update
  log('notify %s on %s (%s)', type, agenda.slug, agenda.uid);

  const aggregationAction = determineAggregationAction(type, data.before, data.event);

  if (!aggregationAction) {
    log('no aggregation action is taken');
    return;
  }

  if (!await isAgendaSource(agenda)) {
    log('agenda %s is not a source', agenda.slug);
    return;
  }

  queue('dispatch', aggregationAction, data);
}
