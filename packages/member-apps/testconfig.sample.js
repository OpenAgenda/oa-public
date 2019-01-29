const { callbackify } = require( 'util' );
const usersSvc = require( '@openagenda/users' );
const agendasSvc = require( '@openagenda/agendas' );
const keysSvc = require( '@openagenda/keys' );

module.exports = {
  queue: {
    name: 'stakeholderCreateTest',
    threshold: 5,
    redis: {
      host: 'localhost',
      port: 6379
    }
  },
  mysql: {
    database: 'oa_members_test',
    host: 'localhost',
    user: 'root',
    password: 'grut'
  },
  schemas: {
    agenda: 'agenda',
    agendaEvent: 'agenda_event',
    apiKeySet: 'api_key_set',
    event: 'event',
    legacyCredentialSet: 'legacy_credential_set',
    occurrence: 'occurrence',
    stakeholder: 'stakeholder',
    stakeholderSettings: 'agenda_stakeholder_settings',
    user: 'user',
    userToken: 'user_token'
  },

  mw: {
    limit: 20
  },

  imagePath: '//openagendatst.s3.amazonaws.com/',

  files: {
    tmpPath: '/var/tmp',
    bucket: 'openagendatst',
    accessKeyId: 'FYTFUITFHJGK',
    secretAccessKey: 'fresgrse/grre+gregrehtr'
  },

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
  } ],

  interfaces: {
    getEventCount: ( agendaId, userId, cb ) => {
      cb( null, 35 );
    },
    getUser: identifiers => callbackify( usersSvc.findOne )( { query: identifiers } ),
    getExistingCredentials: ( agendaId, cb ) => {

      agendasSvc.get( { id: agendaId }, { instanciate: true, private: null }, ( err, agenda ) => {

        if ( err ) return cb( err );

        agenda.getRoles( ( err, credentials ) => {

          if ( err ) return cb( err );

          cb( null, credentials.map( c => c.value ) );

        } );

      } );

    },
    onMessage: ( stakeholder, message, cb ) => {
      cb()
    },
    keys: {
      get: identifiers => keysSvc( identifiers ).get(),
      create: ( identifiers, data ) => keysSvc( identifiers ).create( data ),
      remove: identifiers => keysSvc( identifiers ).remove()
    }
  },
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
  }
};
