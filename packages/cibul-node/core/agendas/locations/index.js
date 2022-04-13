'use strict';

const list = require('./list');
const get = require('./get');
const patch = require('./patch');
const remove = require('./remove');
const merge = require('./merge');
const update = require('./update');
const create = require('./create');
const getSettings = require('./getSettings');

module.exports = (core, agendaOrUid) => (
  {
    create: create(core, agendaOrUid),
    update: update(core, agendaOrUid),
    patch: patch(core, agendaOrUid),
    remove: remove(core, agendaOrUid),
    get: get(core, agendaOrUid),
    list: list(core, agendaOrUid),
    merge: merge(core, agendaOrUid),
    settings: {
      get: getSettings(core, agendaOrUid)
    }
  }
);
