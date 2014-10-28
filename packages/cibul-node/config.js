var currentEnv = process.env.NODE_ENV || 'dev',

deepExtend = require('deep-extend'),

config = {
  all: {
    env: 'prod',
    port: 8901,
    multiCore: true,
    logPath : '/var/tmp/cibul-node.log',
    name: 'cibul-node',
    root: 'https://cibul.net',
    db: {
      database: 'cibul',
      host: 'cibul.cjlxznnlwwtq.eu-west-1.rds.amazonaws.com',
      port: 3306,
      user: 'root',
      password: 'V4\'&4F:,Mtji\'hzq'
    },
    es: {
      host: '10.74.132.55',
      port : 9200,
      indexName : 'cibul',
      channel: 'main'
    },
    redis: {
      host: '10.74.132.55',
      port: 6379
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
      imageBucketPath: 'https://cibul.s3.amazonaws.com/'
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
        'eventShow' : {
          method: 'get',
          uri: '/event/:slug'
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
    multiCore: false,
    db: {
      database: 'cibuldev',
      host: 'localhost',
      user: 'root',
      password: 'grut'
    },
    es: {
      host: 'localhost',
      port : 9200,
      indexName : 'cibuldev',
      channel : 'maindev'
    },
    redis: {
      host: 'localhost',
      port: 6389
    },
    routes: {
      defaultGlobalsPrefix: '/frontend_dev.php'
    }
  },
  
  test: {
    env: 'test',
    multiCore: false,
    db: {
      database: 'cibultest',
      host: 'localhost',
      user: 'root',
      password: 'grut'
    },
    es: {
      host: 'localhost',
      port : 9200,
      indexName : 'cibultest',
      channel : 'maintest'
    },
    redis: {
      host: 'localhost',
      port: 6389
    }
  },
  
  prod: {}
};

process.env.NODE_ENV = currentEnv;

module.exports = deepExtend(config.all, config[currentEnv]);