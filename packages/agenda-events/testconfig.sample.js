"use strict";

module.exports = {

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
      agendaEvent: 'legacy_agenda_event'
    }
  },

  interfaces: {

    onCreate: agendaEvent => {},

    onUpdate: agendaEvent => {},

    onRemove: agendaEvent => {}

  }

}