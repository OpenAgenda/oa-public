'use strict';

const events = require('./events');
const Settings = require('./settings');
const create = require('./create');
const update = require('./update');
const remove = require('./remove');
const members = require('./members');
const get = require('./get');

module.exports = services => {
  const settings = Settings(services);

  return Object.assign(agendaUid => ({
    get: get.bind(null, services, agendaUid),
    update: update.bind(null, services, agendaUid),
    remove: remove.bind(null, agendaUid),
    events: events(services, agendaUid),
    members: members(services, agendaUid),
    settings: settings(agendaUid)
  }), { create });
}
