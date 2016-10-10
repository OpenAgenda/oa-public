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
    accessKeyId: 'dsqdsq',
    secretAccessKey: 'ezfrgfe/dsqdqs+dsqdqs'
  },
  imagePath: '//openagendatst.s3.amazonaws.com/',
  debug: true
};