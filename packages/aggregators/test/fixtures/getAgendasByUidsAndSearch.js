'use strict';

const agendas = require('./agendas.json');

module.exports = async (uids = [], searchQuery = null) => {
  return agendas
    .filter(a => uids.includes(a.uid))
    .filter(a => searchQuery ? a.title.indexOf(searchQuery) !== -1 : true);
}
