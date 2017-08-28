"use strict";

module.exports = {

  mysql: {
    host: '127.0.0.1',
    database: 'oatest_event',
    password: 'grut',
    user: 'root'
  },

  redis: {
    host: 'localhost',
    port: 6379
  },

  schemas: {
    event: 'event'
  },

  imagePath: '//openagendatst.s3.amazonaws.com/',
  defaultImagePath: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png',

  files: {
    tmpPath: __dirname + '/test/tmp',
    bucket: 'openagendatst',
    accessKeyId: '-----',
    secretAccessKey: '-----'
  },

  legacy: {
    mysql: {
      host: '127.0.0.1',
      database: 'oatest_event',
      password: 'grut',
      user: 'root'
    },
    schemas: {
      event: 'legacy_event',
      occurrence: 'legacy_occurrence',
      eventTranslation: 'legacy_event_translation',
      location: 'legacy_location',
      eventLocation: 'legacy_event_location',
      eventLocationTranslation: 'legacy_event_location_translation',
      agendaEvent: 'legacy_agenda_event',
      user: 'legacy_user',
      agenda: 'legacy_agenda',
      deleted: 'legacy_deleted'
    }
  },

  interfaces: {

    onCreate: event => {},

    onUpdate: ( before, after ) => {},

    beforeRemove: ( event, context, cb ) => {

      cb();
      
    },

    onRemove: event => {},

    getOriginAgendas: ( uids, options, cb ) => {

      cb( null, uids.map( uid => ( {
        uid,
        title: 'La Gargouille',
        image: null,
        offical: true
      } ) ) );

    },

    getLocations: ( uids, options, cb ) => {

      cb( null, uids.map( uid => ( {
        name: 'La case de Janine',
        uid,
        latitude: 48.8674277,
        longitude: 2.350881,
        address: '1 passage du ponceau, Paris'
      } ) ) );

    }

  }

}