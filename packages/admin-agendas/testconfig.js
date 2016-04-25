"use strict";

module.exports = {
  mysql : {
    host : '127.0.0.1',
    database : 'openagenda_admintest',
    password : 'grut',
    user : 'root'
  },
  schemas : {
    agenda: 'agenda',
    event: 'event',
    agendaEvent: 'agenda_event',
    occurrence: 'occurrence',
    stakeholder: 'stakeholder',
    stakeholderSettings: 'stakeholder_settings',
    user: 'user'
  },
  mw: {
    limit: {
      default: 20,
      max: 100
    }
  }
}