var currentEnv = process.env.NODE_ENV || 'dev',

deepExtend = require('deep-extend'),

config = {
  all: {
    env: 'prod',
    port: 8901,
    multiCore: true,
    mainChannel: 'main',
    logPath : '/var/tmp/cibul-node.log',
    logPathDebug : '/var/tmp/cibul-node-debug.log',
    logPathError : '/var/tmp/cibul-node-errors.log',
    name: 'cibul-node',
    domain: 'cibul.net',
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
      imageBucketPath: 'https://cibul.s3.amazonaws.com/',
      staticBucketPath: 'https://cibulstatic.s3.amazonaws.com/'
    },
    mailjet: {
      apiKey: '8c200831a70d4f391bd697fa3cbca6a3',
      apiSecret: '6554476977a74b9cace0ddd0dc1ea657'
    },
    newsletter: {
      featuredLimit: 10,  // maximum number of featured events displayable in the same newsletter campaign
      selectionLimit: 30  // maximum number of events displayable in the selection of a newsletter campaign
    },
    twitter: {
      name: '@cibul'
    },
    bridges: {
      swapcard: {
        redirect: 'http://cibul.net/services/swapcard/connect/callback',
        clientID: '5_2teox6oxnwg0k4cscwwk8gs84cwo0ococck0og4wkswwwc4ggc',
        clientSecret: '4ze5s2xa5y4g48kw0wow8sg8ssc4wcg0kcc8gwks8coww4ssos',
        token: 'ZmI4YzlhMzFlZGY3ODdkZjg3MzU3YTUxN2MxYmRjNmMwNTdmZGFkM2RlNGE5N2Q3YTBkOWU1NmY2YjI1ZWExMQ',
        baseSite: 'https://apidev.swapcard.com',
        authorizePath: '/oauth/v2/auth',
        accessTokenPath: '/oauth/v2/token',
        emptyImage: 'white300x300.jpg'
      }
    },
    routes: {
      globals: {
        'authShow' : {
          method: 'get',
          uri: '/auth'
        },
        'signup' : {
          method: 'get',
          uri: '/signup'
        },
        'homeShow' : {
          method: 'get',
          uri: '/home'
        },
        'aboutShow' : {
          method: 'get',
          uri: '/about'
        },
        'termsShow' : {
          method: 'get',
          uri: '/termsofuse'
        },
        'searchEvent' : {
          method: 'get',
          uri: '/events/search'
        },
        'agendaEventNew' : {
          method: 'get',
          uri: '/:slug/addevent'
        },
        'agendaEventEdit' : {
          method: 'get',
          uri: '/:slug/event/:eventSlug/edit'
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
        'agendaXml' : {
          method: 'get',
          uri: '/agendas/:uid.xml'
        },
        'agendaEmbedIndex' : {
          method: 'get',
          uri: '/:slug/admin/webembed'
        },
        'agendaShowByUid' : {
          method: 'get',
          uri: '/agendas/:uid'
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
        },
        'eventShare' : {
          method: 'get',
          uri: '/share/event/:eventSlug'
        },
        'eventEdit' : {
          method: 'get',
          uri: '/event/:eventSlug/edit'
        },
        'eventEmbedEdit' : {
          method: 'get',
          uri: '/embed/event/:uid/edit'
        },
        'eventRemove' : {
          method: 'get',
          uri: '/remove/event/:eventSlug'
        },
        'eventCalendarShare' : {
          method: 'get',
          uri : '/calendarexport/:eventSlug'
        },
        'conversationAgendaContact' : {
          method: 'get',
          uri: '/messages/new?type=7&aUid=:uid'
        }
      },
      defaultGlobalsPrefix: ''
    }
  },

  dev: {
    root: 'http://d.cibul.net',
    env: 'dev',
    multiCore: false,
    mainChannel: 'maindev',
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
    },
    newsletter: {
      featuredLimit: 3,  // maximum number of featured events displayable in the same newsletter campaign
      selectionLimit: 5  // maximum number of events displayable in the selection of a newsletter campaign
    },
    aws: {
      accessKeyId: 'AKIAJCTNQBIZSAPX7HUQ',
      secretAccessKey: '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',
      region: 'eu-west-1',
      imageBucketPath: 'https://cibultest.s3.amazonaws.com/',
      staticBucketPath: 'https://cibulstatic.s3.amazonaws.com/'
    },
    bridges: {
      swapcard: {
        redirect: 'http://d.cibul.net/services/swapcard/connect/callback'
      }
    }
  },
  
  test: {
    env: 'test',
    multiCore: false,
    mainChannel: 'maintest',
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
    },
    aws: {
      accessKeyId: 'AKIAJCTNQBIZSAPX7HUQ',
      secretAccessKey: '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',
      region: 'eu-west-1',
      imageBucketPath: 'https://cibultest.s3.amazonaws.com/',
      staticBucketPath: 'https://cibulstatic.s3.amazonaws.com/'
    },
  },
  
  prod: {}
};

process.env.NODE_ENV = currentEnv;

module.exports = deepExtend( config.all, config[currentEnv] );