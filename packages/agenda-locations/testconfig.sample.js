"use strict";

module.exports = {
  mysql: {
    host: 'localhost',
    user: 'root',
    password: 'grut',
    database: 'location_test',
    table: 'location',
    agendaSettingsTableName: 'location_agenda_settings'
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
