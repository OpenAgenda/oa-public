'use strict';

const events = require('./events');
const settings = require('./settings');
const create = require('./create');
const update = require('./update');
const remove = require('./remove');

const listMembers = require('./members/list');

module.exports = Object.assign((services, agendaUid) => {
  const {
    agendas
  } = services;

  return {
    get: agendas.get.bind(null, { uid: agendaUid }),
    update: update.bind(null, agendaUid),
    remove: remove.bind(null, agendaUid),
    events: events(services, agendaUid),
    members: Object.assign(listMembers.bind(null, agendaUid), {
    }),
    settings: settings(agendaUid)
  }
}, {
  create
} );
