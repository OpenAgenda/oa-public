'use strict';

module.exports = (eventSearch, agendaUid) => {
  return eventSearch(`agendas_${agendaUid}`);
}
