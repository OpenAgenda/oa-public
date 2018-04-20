"use strict";

module.exports = {
  services: {
    agendas: false
  },
  mysql : {
    host : '127.0.0.1',
    database : 'oa_test_agendasettings',
    password : 'grut',
    user : 'root'
  },
  schemas : {
    agenda: 'agenda',
    occurrence: 'occurrence',
    agendaEvent: 'agenda_event',
    legacyCredentialSet: 'legacy_credential_set'
  },
  files: {
    tmpPath: '/var/tmp/',
    bucket: 'openagendatst',
    accessKeyId: 'dsqdsq',
    secretAccessKey: 'ezfrgfe/dsqdqs+dsqdqs'
  },
  imagePath: '//openagendatst.s3.amazonaws.com/',
  debug: true,
  redis: {
    connection: {
      host: 'localhost',
      port: 6379
    }
  }
};