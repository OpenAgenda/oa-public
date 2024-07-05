'use strict';

const model = require('../../model');

const utils = require('../../../lib/utils');

const w = require('when');

const extAgendaSvc = require('@openagenda/agendas');

const legacyEventSvc = require('../../event');

const search = require('./search');

const log = require('@openagenda/logs')('services/agenda/instance');

const cache = require('../../cache');

const config = require('../../../config');

module.exports = instanciate;

function instanciate(data) {
  const instance = model.agendas().instance(data);

  const svcInstance = utils.extend({}, instance, {
    getContributionSettings,
    events: {
      new: newEvent,
      list: instance.events.list,
      get: instance.events.get,
    },
    refreshUpdatedAt,
  });

  search(svcInstance, instance, [
    'search',
    'searchStream',
    'aggregate',
    'resync',
  ]);

  return cache('agenda', svcInstance, [], ['addEvent', 'removeEvent']);

  function refreshUpdatedAt() {
    instance.save({ updatedAt: new Date() }, err => {
      if (err) {
        log('error', 'could not clear timestamp of agenda %s: %s', instance.id, err);
      }
    });
  }

  function newEvent(cb) {
    const newEventInst = legacyEventSvc.instanciate(instance.events.new());

    if (cb) cb(null, newEventInst);

    return newEventInst;
  }

  function getContributionSettings(cb) {
    extAgendaSvc.get({ id: instance.id }, { private: null }, (err, agenda) => {
      if (err || !agenda) return cb(err || 'agenda not found');

      cb(null, agenda.settings.contribution);
    });
  }
}
