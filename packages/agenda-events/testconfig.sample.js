"use strict";

module.exports = {

  redis: {
    host: '127.0.0.1',
    port: 6379
  },

  mysql : {
    host : '127.0.0.1',
    database : 'oatest_agenda_event',
    password : 'grut',
    user : 'root'
  },

  schemas: {
    agendaEvent: 'agenda_event'
  },

  legacy: {
    mysql : {
      host : '127.0.0.1',
      database : 'oatest_agenda_event',
      password : 'grut',
      user : 'root'
    },
    schemas: {
      agendaEvent: 'legacy_agenda_event',
      event: 'legacy_event',
      agenda: 'legacy_agenda',
      eventEditor: 'legacy_event_editor'
    }
  },

  // given by agenda service
  eventStates: {
    REFUSED: -1,
    NOT_VALIDATED: 0,
    VALIDATED: 1,
    PUBLISHED: 2
  },

  interfaces: {

    onCreate: agendaEvent => {},

    onUpdate: agendaEvent => {},

    beforeRemove: async agendaEvent => {},

    onRemove: agendaEvent => {},

  }

}