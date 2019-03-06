"use strict";

module.exports = {

  mysql : {
    host : '127.0.0.1',
    database : 'oatest_event',
    password : 'grut',
    timezone: 'utc',
    user : 'root',
    charset: 'utf8mb4'
  },

  schemas: {
    event: 'event'
  },

  image: {
    base: '//openagendatst.s3.amazonaws.com/',
    default: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png',
    formats: [ {
      name: '{fileKey}.base.image.jpg',
      format: { width: 600 },
      variant: 'base'
    }, {
      name: '{fileKey}.full.image.jpg',
      variant: 'full'
    }, {
      name: '{fileKey}.thumb.image.jpg',
      format: { width: 200, height: 200, crop: true },
      variant: 'thumbnail'
    } ]
  },

  // imagePath: ,
  //defaultImagePath: ,

  redis: {
    host: 'localhost',
    port: 6379
  },

  legacy: {
    mysql : {
      host : '127.0.0.1',
      database : 'oatest_event',
      password : 'grut',
      user : 'root',
      charset: 'utf8mb4'
    },
    schemas: {
      event: 'legacy_event',
      occurrence: 'legacy_occurrence',
      eventTranslation: 'legacy_event_translation',
      location: 'legacy_location',
      eventLocation: 'legacy_event_location',
      eventLocationTranslation: 'legacy_event_location_translation',
      agendaEvent: 'legacy_agenda_event',
      eventReferences: 'legacy_agenda_event_references',
      user: 'legacy_user',
      agenda: 'legacy_agenda',
      deleted: 'legacy_deleted'
    }
  },

  tests: {

    files: {
      tmpPath: '/var/tmp/',
      bucket: 'openagendatst',
      accessKeyId: '',
      secretAccessKey: ''
    },

    images: {
      tmpPath: '/var/tmp/'
    }
  },

  interfaces: {

    onCreate: event => {},

    onUpdate: ( before, after ) => {},

    beforeRemove: ( event, context, cb ) => { cb() },

    onRemove: event => {},

    getOriginAgendas: ( uids, options, cb ) => {

      cb( null, uids.map( uid => ( {
        uid,
        title: 'La Gargouille',
        image: null,
        offical: true
      } ) ) );

    },

    imageFilesLoad: () => {}, // load func of inited image-files service

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
