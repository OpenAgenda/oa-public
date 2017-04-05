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
    user: 'user',
    legacyCredentialSet: 'review_credential'
  },
  files: {
    tmpPath: '/var/tmp/',
    bucket: 'openagendatst',
    accessKeyId: 'AKIAJCTNQBIZSAPX7HUQ',
    secretAccessKey: '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'
  },
  services: {
    agendas: false,
    agendaStakeholders: false
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
  },
  mw: {
    limit: {
      default: 20,
      max: 100
    }
  },
  queue: {
    name: 'adminAgendasTest',
    threshold: 5,
    redis: {
      host: 'localhost',
      port: 6379
    }
  }
}