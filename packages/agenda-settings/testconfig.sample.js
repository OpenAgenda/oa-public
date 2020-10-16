"use strict";

const Files = require('@openagenda/files');

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
    legacyCredentialSet: 'legacy_credential_set',
    key: 'key'
  },
  Files: Files({
    s3: {
      accessKeyId: process.env.AWS_DEV_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_DEV_SECRET_ACCESS_KEY,
      region: process.env.AWS_DEV_REGION,
      defaultBucket: process.env.AWS_DEV_BUCKET
    },
    defaultProvider: 's3'
  }),
  imagePath: '//openagendatst.s3.amazonaws.com/',
  debug: true,
  redis: {
    connection: {
      host: 'localhost',
      port: 6379
    }
  }
};
