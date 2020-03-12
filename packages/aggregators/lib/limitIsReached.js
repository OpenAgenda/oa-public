'use strict';

const set = require('./set');

module.exports = async function limitIsReached(knex, aggregatorAgendaUid) {
  const deactivatedUntil = new Date();

  deactivatedUntil.setFullYear(deactivatedUntil.getFullYear() + 1);

  return set(knex, aggregatorAgendaUid, { deactivatedUntil }, { patch: true });
};
