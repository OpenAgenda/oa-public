'use strict';

const _ = require('lodash');
const { diff } = require('deep-diff');
const log = require('@openagenda/logs')('services/agendaLocations/onUpdate');

module.exports = queue => {
  return async (before, after) => {
    log('location %s', before.uid);
    try {
      if (diff(
        _.omit(before, ['updatedAt']),
        _.omit(after, ['updatedAt']),
      )) {
        queue('syncImpactedEventsAndAgendas', before, after);
      }
    } catch (e) {
      log('error', 'failed to evaluate distance', e);
    }
  };
};
