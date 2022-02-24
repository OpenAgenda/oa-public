'use strict';

module.exports = function decorateWithAgendaUids(entries, locations, uidsByIds = []) {
  locations.forEach((location, index) => {
    location.agendaUid = uidsByIds.find(({ id }) => id === entries[index].agenda_id)?.uid ?? null;
  });
};
