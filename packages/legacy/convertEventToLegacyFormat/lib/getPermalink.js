'use strict';

module.exports = (agendaSettings, event) => `https://openagenda.com/agendas/${agendaSettings.uid}/events/${event.uid}`;
