"use strict";
module.exports = {
  alias: 'agenda_test',
  site: {
    url: 'https://openagenda.com',
    image: 'https://s3.eu-central-1.amazonaws.com/oastatic/openagenda-185.png'
  },
  mysql : {
    host : '127.0.0.1',
    database : 'agenda_search_test',
    password : 'grut',
    user : 'root'
  },
  schemas : {
    agenda: 'agenda',
    occurrence: 'occurrence',
    agendaEvent: 'agenda_event'
  },
  elasticsearch: {
    //host: 'localhost:9200',
    host: `http://ns397902.ip-151-80-41.eu:9205`,
    apiVersion: '5.3',
    //timeout: 30000
  },
  mw: {
    limit: {
      default: 20,
      max: 100
    }
  },
  services: {
    agendas: false // le service agenda
  },
  image: {
    path: '//cibul.s3.amazonaws.com/',
    default: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
  },
  files: {
    tmpPath: __dirname + '/test/tmp',
    bucket: 'openagendatst',
    accessKeyId: 'AKIAJCTNQBIZSAPX7HUQ',
    secretAccessKey: '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'
  }
}
