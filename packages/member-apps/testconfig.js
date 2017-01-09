const userSvc = require( 'users' );

module.exports = {
  mysql: {
    database: 'oa_members_test',
    host: 'localhost',
    user: 'root',
    password: 'grut'
  },
  schemas: {
    agenda: 'agenda',
    event: 'event',
    stakeholder: 'stakeholder',
    stakeholderSettings: 'agenda_stakeholder_settings',
    agendaEvent: 'agenda_event',
    user: 'user',
    apiKeySet: 'api_key_set'
  },
  mw: {
    limit: 20
  },
  files: {
    tmpPath: '/var/tmp',
    bucket: 'openagendatst',
    accessKeyId: 'AKIAJCTNQBIZSAPX7HUQ',
    secretAccessKey: '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'
  },
  interfaces: {
    getEventCount: ( agendaId, userId, cb ) => {
      cb( null, 35 );
    },
    getUser: ( userId, cb ) => userSvc.get( { id: userId }, cb )
  }
};
