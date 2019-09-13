const agendasSvc = require( '@openagenda/agendas' );
const eventsSvc = require( '@openagenda/events' );

module.exports = {
  mysql: {
    database: 'oa_test_home',
    host: 'localhost',
    user: 'root',
    password: 'grut'
  },

  schemas: {
    agenda: 'review',
    event: 'event',
  },

  files: {
    tmpPath: __dirname + '/test/tmp',
    bucket: 'openagendatst',
    accessKeyId: 'AKIAJCTNQBIZSAPX7HUQ',
    secretAccessKey: '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'
  },

  mw: {
    limit: 20
  },

  interfaces: {
    agendas: {
      list: agendasSvc.list
    },

    members: {
      list: () => ([])
    },

    events: {
      list: eventsSvc.list
    },

    agendaMailTo: () => 'mailto:kevin.bertho@gmail.com'
  },

};

module.exports.services = {
  agendas: {
    imagePath: '//cibul.s3.amazonaws.com/',
    defaultImagePath: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png',

    existingRoles: [ {
      value: 1,
      code: 'contributor'
    }, {
      value: 2,
      code: 'administrator'
    }, {
      value: 3,
      code: 'moderator'
    }, {
      value: 4,
      code: 'reader'
    } ]
  },

  events: {
    legacy: {
      mysql: {
        host: '127.0.0.1',
        database: 'oa_test_event',
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
      onCreate: event => {
      },
      onUpdate: ( before, after ) => {
      },
      beforeRemove: ( event, cb ) => {
        cb()
      },
      onRemove: event => {
      },
      getOriginAgendas: ( uids, options, cb ) => {

        cb( null, uids.map( uid => ( {
          uid,
          title: 'La Gargouille',
          image: null,
          offical: true
        } ) ) );

      },
      getLocations: ( uids, cb ) => {

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
};
