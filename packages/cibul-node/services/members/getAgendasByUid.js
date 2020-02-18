'use strict';

module.exports = (services, agendaUids) => services
  .agendas.list({
    uid: agendaUids
  }, 0, 200, {
    private: null,
    internal: true,
  }).then(({ agendas }) => agendas)
