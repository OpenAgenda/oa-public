"use strict";

module.exports = {
  mysql : {
    host : '127.0.0.1',
    database : 'stakeholder_test',
    password : 'fdsfdsqfdsqf',
    user : 'root'
  },
  schemas : {
    agenda: 'agenda',
    event: 'event',
    stakeholder: 'stakeholder',
    stakeholderSettings: 'agenda_stakeholder_settings',
    agendaEvent: 'agenda_event'
  },
  interfaces: {
    getEventCount: ( agendaId, userId, cb ) => {  cb( null, Math.ceil( Math.random() * 1000 ) );  }
  }
}