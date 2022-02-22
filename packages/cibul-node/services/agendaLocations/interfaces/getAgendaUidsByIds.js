'use strict';

module.exports = function getAgendaUidsByIds(services) {
  return ids => services.agendas.list({ ids }, { private: null }).then(({ agendas }) => agendas.map(a => a.uid));
};
