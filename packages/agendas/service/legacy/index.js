'use strict';

const w = require('when');

const utils = require('@openagenda/utils');
const log = require('@openagenda/logs')('legacy');

const column = require('./column');
const store = require('./store');

function _updateDefaultState(v) {
  log('updating contribution default state');

  const defaultState = utils.deep(v.data, 'settings.contribution.defaultState');

  if (defaultState === undefined) return v;

  const d = w.defer();

  store(v.agendaId, 'moderated', defaultState !== 2, (err) => {
    if (err) return d.reject(err);

    d.resolve(v);
  });

  return d.promise;
}

function agenda(agendaId) {
  /**
   * apply given data to legacy db stores
   */
  function applyToLegacy(data, cb) {
    w({ agendaId, data, loaded: {} })
      .then(_updateDefaultState)

      .done(() => cb(), cb);
  }

  return {
    applyToLegacy,
  };
}

module.exports = Object.assign(agenda, {
  init: (s, k) => {
    column.init(s, k);
  },
});
