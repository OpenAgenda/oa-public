'use strict';

const Files = require('@openagenda/files');

module.exports = {
  mysql : {
    host : '127.0.0.1',
    database : 'oa_test_admin_agendas',
    password : 'grut',
    user : 'root',
    ssl: true
  },
  schemas : {
    agenda: 'agenda',
    user: 'user',
    event: 'event',
    member: 'member',
    stakeholder: 'stakeholder',
    stakeholderSettings: 'stakeholder_settings'
  },
  mw: {
    limit: {
      default: 20,
      max: 100
    }
  },
  services: {
    agendas: false,
    members: false
  },
  queue: {
    names: {
      bulk: 'adminAgendasCreateTest',
      message: 'adminAgendasMessageTest'
    },
    threshold: 5,
    redis: {
      host: 'localhost',
      port: 6379
    }
  },
  Files: Files({
    s3: {
      accessKeyId: process.env.AWS_DEV_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_DEV_SECRET_ACCESS_KEY,
      region: process.env.AWS_DEV_REGION,
      defaultBucket: process.env.AWS_DEV_BUCKET
    },
    defaultProvider: 's3'
  }),
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

    getAgendaCredentialDetails: () => require( '@openagenda/agendas/service/validate/privateFields' ).credentials,

    onCreate: member => {},
    onUpdate: ( before, after ) => {},
    onMessage: ( member, message, context, cb ) => {
      console.log( member, message );
      cb();
    }
  }
}
