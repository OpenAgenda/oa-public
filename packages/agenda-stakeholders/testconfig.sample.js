"use strict";

module.exports = {
  mysql : {
    host : '127.0.0.1',
    database : 'stakeholder_test',
    password : 'fdsqfdsq',
    user : 'fsdqfds'
  },
  schemas : {
    agenda: 'agenda',
    event: 'event',
    stakeholder: 'stakeholder',
    agendaEvent: 'agenda_event',
    stakeholderSettings: 'agenda_stakeholder_settings'
  },
  interfaces: {
    getEventCount: ( agendaId, userId, cb ) => {  cb( null, 35 );  },
    getUser: ( userId, cb ) => { cb( null, {
      id: userId,
      uid: 128492293,
      user_name: 'Zorg', 
      email: 'zorg@galactic.uv' 
    } ) }
  }
}