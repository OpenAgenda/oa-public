'use strict';

const _ = require('lodash');
const Log = require('../utils/Log')('Aggregators/notify');

const determineAggregationAction = require('../utils/determineAggregationAction');

module.exports = async ({
  getAgendaSourceId,
  queue
}, type, data) => {
  const { agenda } = data;
  const log = Log(`${type} on ${agenda.slug} (${agenda.uid})`);

  const aggregationAction = determineAggregationAction(type, data.before, data.event);

  if (!aggregationAction) {
    log('no aggregation action is taken');
    return;
  }

  if (!await getAgendaSourceId(agenda)) {
    log('not a source');
    return;
  }

  log(`dispatching ${aggregationAction}`, _.pick(data, ['batched', 'agenda.uid', 'agenda.slug', 'event.uid', 'event.slug']));

  queue('dispatch', aggregationAction, data);
}
