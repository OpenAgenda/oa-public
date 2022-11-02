'use strict';

const create = require('./create');
const get = require('./get');
const list = require('./list');
const patch = require('./patch');
const remove = require('./remove');
const stream = require('./stream');

module.exports = (core, agendaUid) => ({
  list: list.bind(null, core, agendaUid),
  get: get.bind(null, core, agendaUid),
  create: create.bind(null, core, agendaUid),
  patch: patch.bind(null, core, agendaUid),
  is: get.is.bind(null, core, agendaUid),
  remove: remove.bind(null, core, agendaUid),
  stream: stream.bind(null, core, agendaUid),
});
