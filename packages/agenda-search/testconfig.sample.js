"use strict";

module.exports = {
  alias: 'agenda_test',
  mysql : {
    host : '127.0.0.1',
    database : 'agenda_search_test',
    password : 'fdsqfdsqfdsq',
    user : 'fdqfdsq'
  },
  schemas : {
    agenda: 'agenda',
    occurrence: 'occurrence',
    agendaEvent: 'agenda_event'
  },
  elasticsearch: {
    host: 'localhost:9200',
    log: [ {
      type: 'stdio',
      level: [ 'error', 'warning' ]
    } ],
    apiVersion: '1.3',
    timeout: 30000
  },
  mw: {
    limit: {
      default: 20,
      max: 100
    }
  },
  image: {
    path: '//cibul.s3.amazonaws.com/',
    default: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
  }
}