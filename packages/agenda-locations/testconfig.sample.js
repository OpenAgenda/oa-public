"use strict";

module.exports = {
  mysql: {
    host: process.env.OA_MYSQL_DEV_HOST,
    user: process.env.OA_MYSQL_DEV_USER,
    password: process.env.OA_MYSQL_DEV_PASSWORD,
    database: 'location_test',
    table: 'location',
    ssl: true
  },
  schemas: {
    location: 'location',
    agendaSettings: 'location_agenda_settings'
  },
  files: {
    tmpPath: __dirname + '/test/tmp',
    bucket: 'openagendatst',
    accessKeyId: 'ACCESSKEY',
    secretAccessKey: 'SECRETKEY'
  },
  redis: {
    host: 'localhost',
    port: 6379
  },
  interfaces: {
    getEventCount: ( l, cb ) => {

      cb( null, 0, 0 );

    },
    getAgendaSettings: ( agendaId, cb ) => {

      cb( null, {
        translation: {
          enabled: true,
          options: 'eyJ1c2VyIjoiQ1VMVFVSRSIsInBhcAAAAAAAAAAAAlU3elQ3cWhhIAA=',
          service: 'reverso',
          sets: [ {
            source: "fr",
            checked: [ "it", "es", "de", "en" ],
            target: [ "it", "es", "de", "en" ]
          } ],
          "source": "fr"
        }
      } );

    }
  }
}
