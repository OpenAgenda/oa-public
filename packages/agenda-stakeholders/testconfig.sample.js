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
    onCreate: ( stakeholder, context ) => {},
    onUpdate: ( before, after, context ) => {},
    getEventCount: ( agendaId, userId, cb ) => {  cb( !agendaId || !userId ? 'missing identifier' : null, 35 );  },
    getUser: ( identifiers, cb ) => {

      cb( null, {
        id: identifiers.id || 123,
        uid: 128492293,
        fullName: 'Zorg',
        email: identifiers.email || 'zorg@galactic.uv'
      } );

    },
    getExistingCredentials: ( agendaId, cb ) => {

      cb( null, [ 1, 2, 3, 4 ] );

    },
    beforeTransferEvent: ( eventUid, ownerId, nextOwnerId, cb ) => {
      cb();
    },
    onTransferEvent: ( eventUid ) => {},
    onMessage: ( stakeholder, message, cb ) => { cb() }
  },
  queue: {
    names: {
      bulk: 'stakeholderCreateTest',
      message: 'stakeholderMessageTest'
    },
    threshold: 5,
    redis: {
      host: 'localhost',
      port: 6379
    }
  }
}
