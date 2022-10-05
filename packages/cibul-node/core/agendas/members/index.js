'use strict';

const create = require('./create');
const get = require('./get');
const list = require('./list');
const patch = require('./patch');
const remove = require('./remove');

module.exports = (services, agendaUid) => ({
  list: list.bind(null, services, agendaUid),
  get: get.bind(null, services, agendaUid),
  create: create.bind(null, services, agendaUid),
  patch: patch.bind(null, services, agendaUid),
  is: get.is.bind(null, services, agendaUid),
  remove: remove.bind(null, services, agendaUid),
});
