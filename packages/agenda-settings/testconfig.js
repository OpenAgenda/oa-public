"use strict";

module.exports = {
  services: {
    agendas: false
  },
  mysql : {
    host : '127.0.0.1',
    database : 'openagenda_agendasettingstest',
    password : 'grut',
    user : 'root'
  },
  schemas : {
    agenda: 'agenda',
    agendaEvent: 'agendaEvent',
    occurence: 'occurence',
    legacyCredentialSet: 'legacyCredentialSet'
  },
  files: {
    tmpPath: '/var/tmp/',
    bucket: 'openagendatst',
    accessKeyId: 'AKIAJCTNQBIZSAPX7HUQ',
    secretAccessKey: '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'
  },
  imagePath: '//openagendatst.s3.amazonaws.com/',
  debug: true
};