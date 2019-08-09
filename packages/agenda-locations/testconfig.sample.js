"use strict";

module.exports = {
  elasticsearch: {
    host: 'localhost:9200',
    log: [ {
      type: 'stdio',
      level: [ 'error', 'warning' ]
    } ],
    index: 'location_test',
    apiVersion: '1.3',
    timeout: 30000
  },
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
    getStakeholder: ( agendaId, stakeholderId, cb ) => {

      cb( null, {
        contactName: 'LARROUMEC',
        organization: {
          label: 'DRAC PACA',
          slug: 'drac-paca'
        },
        contactPosition: 'CORRESPONDANT',
        contactNumber: '04 42 16 19 75'
      } );

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
