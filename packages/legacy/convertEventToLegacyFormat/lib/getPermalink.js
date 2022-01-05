'use strict';

module.exports = (agendaSettings, event) => {
  const permalink = `https://openagenda.com/agendas/${agendaSettings.uid}/events/${event.uid}`;

  if (!event?.sourceAgendas) {
    return permalink;
  }

  const source = event.sourceAgendas.find(sourceAgenda => sourceAgenda.uid === event.originAgenda.uid);

  return source ? `https://openagenda.com/agendas/${source.uid}/events/${event.uid}` : permalink;
};
