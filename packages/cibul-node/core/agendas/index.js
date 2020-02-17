'use strict';

const events = require('./events');
const Settings = require('./settings');
const create = require('./create');
const update = require('./update');
const remove = require('./remove');
const members = require('./members');
const get = require('./get');

module.exports = core => {
  const settings = Settings(core);

  return Object.assign(agendaUid => ({
    get: get.bind(null, core.services, agendaUid),
    update: update.bind(null, core, agendaUid),
    remove: remove.bind(null, agendaUid),
    events: events(core, agendaUid),
    members: members(core.services, agendaUid),
    settings: settings(agendaUid)
  }), {
    create: create.bind(null, core)
  });
}
