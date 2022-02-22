'use strict';

module.exports = function getAgendaUidById(services) {
  return id => services.agendas.get({ id }, { private: null }).then(a => a?.uid);
};
