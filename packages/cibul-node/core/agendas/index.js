'use strict';

const Events = require('./events');
const embeds = require('./embeds');
const Settings = require('./settings');
const create = require('./create');
const update = require('./update');
const remove = require('./remove');
const members = require('./members');
const locations = require('./locations');
const get = require('./get');
const search = require('./search');

module.exports = core => {
  const settings = Settings(core);
  const events = Events(core);

  return Object.assign(agendaUid => ({
    get: get.bind(null, core, agendaUid),
    update: update.bind(null, core, agendaUid),
    remove: remove.bind(null, agendaUid),
    events: events(agendaUid),
    locations: locations(core, agendaUid),
    members: members(core.services, agendaUid),
    settings: settings(agendaUid),
    embeds: embeds(core, agendaUid)
  }), {
    search: search(core),
    create: create.bind(null, core),
    rebuildIndex: () => core.services.agendaSearch.rebuild()
  });
};
