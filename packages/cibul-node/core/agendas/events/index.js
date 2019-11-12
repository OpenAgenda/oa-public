'use strict';

const add = require('./add');
const batch = require('./batch');
const get = require('./get');
const list = require('./list');
const create = require('./create');
const remove = require('./remove');
const update = require('./update');
const validate = require('./validate');

module.exports = (services, agendaUid) => ({
  get: get.bind(null, services, agendaUid),
  list: list.bind( null, agendaUid ),
  create: create.bind(null, services, agendaUid),
  add: add.bind(null, services, agendaUid),
  remove: remove.bind( null, agendaUid ),
  update: update.bind(null, services, agendaUid),
  validate: validate.bind(null, services, agendaUid),
  batch: batch(services).bind(null, agendaUid)
});
