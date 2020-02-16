"use strict";

const createAgenda = require('../agendas/create');

module.exports = (core, networkUid, data) => createAgenda(core, { ...data, networkUid }, {
  updateLegacy: true
});
