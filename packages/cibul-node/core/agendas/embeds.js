'use strict';

module.exports = (core, agendaUid) => {
  if (!core.services.legacy) {
    return;
  }

  const {
    services: {
      legacy: {
        embeds
      }
    }
  } = core;

  return Object.assign(embedUid => ({
    update: embeds(agendaUid).update.bind(null, embedUid),
    get: embeds(agendaUid).get.bind(null, embedUid)
  }), {
    create: embeds(agendaUid).create,
    list: embeds(agendaUid).list
  });
};
