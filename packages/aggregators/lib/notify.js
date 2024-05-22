'use strict';

const _ = require('lodash');
const logs = require('@openagenda/logs');

const log = logs('notify');

const determineAggregationAction = require('../utils/determineAggregationAction');

module.exports = async ({ getAgendaSourceId, queue }, type, data) => {
  const { agenda } = data;
  const logBundle = { agenda: _.pick(agenda, ['slug', 'uid']), type };

  log.info('processing', logBundle);

  const aggregationAction = determineAggregationAction(
    type,
    data.before,
    data.event,
  );

  if (!aggregationAction) {
    log('no aggregation action is taken', logBundle);
    return;
  }

  if (!await getAgendaSourceId(agenda)) {
    log('not a source', logBundle);
    return;
  }

  log(
    `dispatching ${aggregationAction}`,
    _.pick(data, [
      'batched',
      'agenda.uid',
      'agenda.slug',
      'event.uid',
      'event.slug',
    ]),
  );

  queue('dispatch', aggregationAction, data);
};
