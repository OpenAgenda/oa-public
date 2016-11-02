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
    user: 'user',
  },
  mw: {
    limit: {
      default: 20,
      max: 100
    }
  },
  services: {
    agendas: false,
    agendaStakeholders: false
  }
}