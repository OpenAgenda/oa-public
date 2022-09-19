'use strict';

const add = require('./add');
const Batch = require('./batch');
const get = require('./get');
const search = require('./search');
const list = require('./list');
const create = require('./create');
const remove = require('./remove');
const update = require('./update');
const validate = require('./validate');

module.exports = core => {
  const batch = Batch(core);

  return agendaUid => ({
    get: get.bind(null, core.services, agendaUid),
    list: list.bind(null, core.services, agendaUid),
    create: create.bind(null, core, agendaUid),
    add: add.bind(null, core, agendaUid),
    remove: remove.bind(null, core.services, agendaUid),
    update: update.bind(null, core, agendaUid),
    patch: update.patch.bind(null, core, agendaUid),
    validate: Object.assign(
      validate.bind(null, core, agendaUid),
      { eventFields: validate.eventFields }
    ),
    batch: batch.bind(null, agendaUid),
    search: Object.assign(search.bind(null, core, agendaUid), {
      rebuild: search.rebuild.bind(null, core, agendaUid),
      resyncEvent: search.resyncEvent.bind(null, core, agendaUid),
      get: search.get.bind(null, core, agendaUid)
    })
  });
};
