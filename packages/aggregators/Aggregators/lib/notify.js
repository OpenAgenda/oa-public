'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('Aggregators/notify');

const determineAggregationAction = require('../utils/determineAggregationAction');

module.exports = async ({
  getAgendaSourceId,
  queue
}, type, data) => {
  const { agenda } = data;
  // add, remove, update
  log('notify %s on %s (%s)', type, agenda.slug, agenda.uid);

  const aggregationAction = determineAggregationAction(type, data.before, data.event);

  if (!aggregationAction) {
    log('no aggregation action is taken');
    return;
  }

  if (!await getAgendaSourceId(agenda)) {
    log('agenda %s is not a source', agenda.slug);
    return;
  }

  log('dispatching', aggregationAction, _.pick(data, ['batched', 'agenda.uid', 'agenda.slug', 'event.uid', 'event.slug']));

  queue('dispatch', aggregationAction, data);
}
