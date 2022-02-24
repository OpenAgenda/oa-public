'use strict';

module.exports = function getAgendaUidsByIds(services) {
  return ids => services.agendas.list({ ids }, {
    private: null,
    internal: true
  }).then(
    ({ agendas }) => {
      const result = agendas.map(a => ({
        uid: a.uid,
        id: a.id
      }));

      return Array.isArray(ids) ? result : result.pop();
    }
  );
};
