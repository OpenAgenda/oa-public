const agendasSvc = require( '@openagenda/agendas' );
const stakeholdersSvc = require( '@openagenda/agenda-stakeholders' );
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
    stakeholder: 'reviewer',
    event: 'event'
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

    stakeholders: {
      list: ( userId, ...args ) => stakeholdersSvc.user( userId ).list( ...args )
    },

    events: {
      list: eventsSvc.list
    }
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

  agendaStakeholders: {
    queue: {
      names: {
        bulk: 'stakeholderCreateTest',
        message: 'stakeholderMessageTest'
      },
      threshold: 5,
      redis: {
        host: 'localhost',
        port: 6379
      }
    },
    interfaces: {
      getEventCount: ( agendaId, userId, cb ) => {
        cb( !agendaId || !userId ? 'missing identifier' : null, 35 );
      },
      getUser: ( identifiers, cb ) => {
        cb( null, {
          id: identifiers.id || 123,
          uid: 128492293,
          fullName: 'Zorg',
          email: identifiers.email || 'zorg@galactic.uv'
        } );
      },
      getExistingCredentials: ( agendaId, cb ) => {
        cb( null, [ 1, 2, 3, 4 ] );
      },
      beforeTransferEvent: ( eventUid, ownerId, nextOwnerId, cb ) => {
        console.log( 'beforeTransferEvent', ownerId, nextOwnerId );
        cb();
      },
      onMessage: ( stakeholder, message, cb ) => {
        console.log( 'Send message', message, 'to stakeholder', stakeholder.id );
        cb()
      }
    }

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
      getOriginAgendas: ( uids, cb ) => {

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
