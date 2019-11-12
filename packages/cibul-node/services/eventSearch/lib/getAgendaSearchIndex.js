'use strict';

module.exports = (eventSearch, agendaUid) => {
  return eventSearch(`agendas:${agendaUid}`);
}
