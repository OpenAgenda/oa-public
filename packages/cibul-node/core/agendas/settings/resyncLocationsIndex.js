'use strict';

module.exports = async (services, agendaUid) => {
  const {
    agendas,
    agendaLocations
  } = services;

  const agenda = await agendas.get({ uid: agendaUid }, { private: null, internal: true });

  return new Promise((rs, rj) => {
    agendaLocations.resync(agenda.id, (err, result) => {
      if (err) {
        rj(err);
      } else {
        rs(result);
      }
    });
  });
}
