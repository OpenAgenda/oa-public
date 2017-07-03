"use strict";

module.exports = {
  mysql : {
    host : '127.0.0.1',
    database : 'oa_test_admin_agendas',
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
  },
  queue: {
    names: {
      bulk: 'adminAgendasCreateTest',
      message: 'adminAgendasMessageTest'
    },
    threshold: 5,
    redis: {
      host: 'localhost',
      port: 6379
    }
  },
  interfaces: {
    getEventCount: ( agendaId, userId, cb ) => {

      cb( !agendaId || !userId ? 'missing identifier' : null, 35 );

    },
    getUser: ( identifiers, cb ) => {

      cb( null, {
        id: identifiers.id || 123,
        uid: 128492293,
        full_name: 'Zorg',
        email: identifiers.email || 'zorg@galactic.uv'
      } );

    },

    getExistingCredentials: ( agendaId, cb ) => {

      cb( null, [ 1, 2, 3, 4 ] );

    },

    onCreate: stakeholder => {},
    onUpdate: ( before, after ) => {}
  }
}