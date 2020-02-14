'use strict';

const list = require('./list');

module.exports = (services, agendaUid) => ({
  list: list.bind(null, services, agendaUid)
});
