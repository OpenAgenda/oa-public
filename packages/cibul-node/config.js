var currentEnv = process.env.NODE_ENV || 'development',

deepExtend = require('deep-extend'),

config = {
  all: {
    env: process.env.NODE_ENV,
    port: 8901,
    logLevel: '*',
    db: {
      database: 'cibuldev',
      host: 'localhost',
      user: 'root',
      password: 'grut'
    },
    redis: {
      host: '127.0.0.1',
      port: 6389
    },
    session: {
      cookie: 'symfony',
      prefix: 'session:'
    },
    mailer: {
      source: 'no-reply@cibul.net',
      replyTo: 'admin@cibul.net'
    },
    aws: {
      accessKeyId: 'AKIAJCTNQBIZSAPX7HUQ',
      secretAccessKey: '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',
      region: 'eu-west-1'
    },
    routes: {
      globals: {
        'searchEvent' : {
          method: 'get',
          uri: '/events/search'
        },
        'agendaShow' : {
          method: 'get',
          uri: '/:slug'
        },
        'agendaEventShow' : {
          method: 'get',
          uri: '/:slug/events/:eSlug'
        },
        'agendaEmbedIndex' : {
          method: 'get',
          uri: '/:slug/admin/webembed'
        },
        'agendaAdminShow' : {
          method: 'get',
          uri: '/:slug/admin'
        },
        'agendaAdminContributors' : {
          method: 'get',
          uri: '/:slug/admin/contributors'
        },
        'agendaAdminDataviz' : {
          method: 'get',
          uri: '/:slug/admin/dataviz'
        }
      },
      defaultGlobalsPrefix: ''
    }
  },
  development: {
    routes: {
      defaultGlobalsPrefix: '/frontend_dev.php'
    }
  },
  testing: {
  }
};

module.exports = deepExtend(config.all, config[currentEnv]);