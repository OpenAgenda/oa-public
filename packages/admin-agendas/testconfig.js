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
  mw: {
    limit: {
      default: 20,
      max: 100
    }
  }
}