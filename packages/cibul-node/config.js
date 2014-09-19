var currentEnv = process.env.NODE_ENV || 'dev',

deepExtend = require('deep-extend'),

config = {
  all: {
    env: 'prod',
    port: 8901,
    logLevel: '*',
    root: 'https://cibul.net',
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
    cookie: {
      name: 'cibul'
    },
    mailer: {
      source: 'no-reply@cibul.net',
      replyTo: 'admin@cibul.net'
    },
    aws: {
      accessKeyId: 'AKIAJCTNQBIZSAPX7HUQ',
      secretAccessKey: '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',
      region: 'eu-west-1',
      imageBucketPath: '//cibul.s3.amazonaws.com/'
    },
    routes: {
      globals: {
        'authShow' : {
          method: 'get',
          uri: '/auth'
        },
        'searchEvent' : {
          method: 'get',
          uri: '/events/search'
        },
        'agendaShow' : {
          method: 'get',
          uri: '/:slug'
        },
        'agendaEventNew' : {
          method: 'get',
          uri: '/:slug/addevent'
        },
        'agendaEventShow' : {
          method: 'get',
          uri: '/:slug/event/:eSlug'
        },
        'agendaFeed' : {
          method: 'get',
          uri: '/agendas/:uid.atom'
        },
        'agendaIcal' : {
          method: 'get',
          uri: '/agendas/:uid.ical'
        },
        'agendaCsv' : {
          method: 'get',
          uri: '/agendas/:uid.csv'
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
        },
        'agendaAdminCategories' : {
          method: 'get',
          uri: '/:slug/admin/categories'
        },
        'agendaAdminSources' : {
          method: 'get',
          uri: '/:slug/admin/sources'
        },
        'agendaAdminWeb' : {
          method: 'get',
          uri: '/:slug/admin/webembed'
        },
        'agendaAdminIndesign' : {
          method: 'get',
          uri: '/:slug/admin/xml'
        },
        'agendaAdminFacebook' : {
          mathod: 'get',
          uri: '/:slug/admin/facebook'
        },
        'agendaAdminAdministrators' : {
          method: 'get',
          uri: '/:slug/admin/admins'
        },
        'agendaAdminTheme' : {
          method: 'get',
          uri: '/:slug/admin/edit'
        },
        'agendaAdminSettings' : {
          method: 'get',
          uri: '/:slug/admin/edit'
        }
      },
      defaultGlobalsPrefix: ''
    }
  },
  dev: {
    env: 'dev',
    root: 'https://d.cibul.net',
    routes: {
      defaultGlobalsPrefix: '/frontend_dev.php'
    }
  },
  test: {
    env: 'test',
    db: {
      database: 'cibultest'
    },
  }
};

process.env.NODE_ENV = currentEnv;

module.exports = deepExtend(config.all, config[currentEnv]);