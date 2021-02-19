'use strict';

const create = require('./create');
const get = require('./get');
const list = require('./list');

module.exports = (services, agendaUid) => ({
  list: list.bind(null, services, agendaUid),
  get: get.bind(null, services, agendaUid),
  create: create.bind(null, services, agendaUid),
  is: get.is.bind(null, services, agendaUid)
});
