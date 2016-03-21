var deepExtend = require( 'deep-extend' ),

config = {
  all: {
    env: 'prod',
    port: 8901,
    multiCore: true,
    mainChannel: 'main',
    jobsQueue: 'jobs',
    queues: {
      aggregator: 'aggregator',
      groupActions: 'groupactions',
      controlData: 'agendaControlDataQueue'
    },
    legacyQueue: 'bgestack',
    tmpFolderPath: '/var/tmp/',
    logPath : '/var/tmp/cibul-node.log',
    logPathDebug : '/var/tmp/cibul-node-debug.log',
    logPathError : '/var/tmp/cibul-node-errors.log',
    logNameSpaces: false,
    logEntriesToken: '1cdd4c11-fe29-4144-ae18-e4fb8392c282',
    name: 'cibul-node',
    domain: 'openagenda.com',
    root: 'https://openagenda.com',
    googleAnalyticsId: 'UA-60305866-1',
    embedGoogleAnalyticsId: 'UA-60305866-2',
    useCache: true,
    agendaCacheExpire: 30*1000,
    shares: {
      agenda: [ 'twitter', 'facebook', 'googlePlus', 'linkedIn' ]
    },
    adminEmail: 'admin@openagenda.com',
    mapboxAccessToken: 'pk.eyJ1Ijoia2FvcmUiLCJhIjoidDZ1UW5HWSJ9.VspmN8kRdEgRm2A91RjNow',
    geocodeFarm: {
      key: 'c90247db-b0de461fb1e9-8517d6450e7b'
    },
    db: {
      database: 'oa',
      host: 'cibul.cjlxznnlwwtq.eu-west-1.rds.amazonaws.com',
      port: 3306,
      user: 'root',
      password: 'V4\'&4F:,Mtji\'hzq',
      cache: true
    },
    auth: {
      local: {
        useCaptcha: true,
        captchaKey: '6LeO0AMTAAAAAGGzr5naEkY_VCM5xILpOp2j_1qY',
        captchaSecret: '6LeO0AMTAAAAADtTdp2ShTEp-nVFktIyzPqkXr22',
        captchaVerify: 'https://www.google.com/recaptcha/api/siteverify'
      },
      facebook: {
        id: '218055591568337',
        secret: '444c327ed38e220805f23a40110475b4'
      },
      twitter: {
        key: 'U6TZ7AMQzbtuUEyQKmShTQ',
        secret: 'e6kB4iMssc6T54JqGtVgIqA7FbYnhGsn6YCuAfRFs'
      },
      google : {
        id: '168621602257-al70gdmimj8sj4c1d1pqt8nrfr33srjc.apps.googleusercontent.com',
        secret: 'tCAMVQ3SLe71CWAc-K5AOnpg'
      }
    },
    es: {
      host: 'ec2-54-195-243-94.eu-west-1.compute.amazonaws.com',
      port : 9200,
      indexName : 'cibul',
      channel: 'main'
    },
    esLocation: {
      log: [ {
        type: 'stdio',
        level: [ 'error', 'warning' ]
      } ],
      index: 'location',
      apiVersion: '1.3',
      timeout: 30000
    },
    redis: {
      host: 'ec2-54-195-243-94.eu-west-1.compute.amazonaws.com',
      port: 6379
    },
    session: {
      name: 'oas',
      secret: 'yeepeekayaymadafaka',
      maxAge: 1000*60*60*48,
      storePrefix: 'session:',
      sfName: 'symfony',
      signed: true,
      secure: false
    },
    cookie: {
      name: 'cibul'
    },
    mailer: {
      service: 'ses',
      source: 'no-reply@openagenda.com',
      replyTo: 'admin@openagenda.com',
      simulated: false // legacy ./mailer
    },
    api: {
      redis: {
        prefix: 'apiKeySet:',
        publishCount: 'event/new/dayCount'
      }
    },
    aws: {
      accessKeyId: 'AKIAJCTNQBIZSAPX7HUQ',
      secretAccessKey: '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',
      region: 'eu-west-1',
      imageBucketPath: 'https://cibul.s3.amazonaws.com/',
      tmpBucketPath: 'https://cibultmp.s3.amazonaws.com/',
      staticBucketPath: 'https://cibulstatic.s3.amazonaws.com/',
      bucket: 'cibul',
      tmpBucket: 'cibultmp'
    },
    mailjet: {
      apiKey: '8c200831a70d4f391bd697fa3cbca6a3',
      apiSecret: '6554476977a74b9cace0ddd0dc1ea657'
    },
    oembed: {
      res: 'https://iframe.ly/api/oembed',
      //key: '044c4cbd91d65eab056738',
      //key: '32d62d210e9dcf24c0134e',
      key: '05acdb65a8a86f5d0d792d',
      platforms: [ 
        'youtube', 'dailymotion', 'vimeo', 
        'soundcloud', 'twitter', 'flickr', 
        'instagram', 'tumblr', 'prezi', 
        'google', 'ted', 'ina.fr'
      ]
    },
    newsletter: {
      featuredLimit: 10,  // maximum number of featured events displayable in the same newsletter campaign
      selectionLimit: 30  // maximum number of events displayable in the selection of a newsletter campaign
    },
    twitter: {
      name: '@OpenAgendaFR'
    },
    bridges: {
      swapcard: {
        redirect: 'https://openagenda.com/services/swapcard/connect/callback',
        clientID: '5_55ktc1a47zgogwg4gw8k8s4gg4kk4848s800gwggkswsc4so4o',
        clientSecret: 'mox19rhegg0wc0wkg0gsksoscowk0wss8k0wkcwgkg800woks',
        token: 'MGE5NmZlNzhhNTc2MDBkMDQzZWIzNzVmMzdjODJkOGNmMjFjMTFlOTAwYTM5ZWExYWRjNTg2ZjUxNDlkOWNkNg',
        baseSite: 'https://api.swapcard.com',
        authorizePath: '/oauth/v2/auth',
        accessTokenPath: '/oauth/v2/token',
        emptyImage: 'white300x300.jpg'
      }
    },
    comexposium: {
      contributingAgendaUid: 63430882 // le salon de l'agriculture
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
        'agendaNew' : {
          method: 'get',
          uri: '/new'
        },
        'agendaEventNew' : {
          method: 'get',
          uri: '/:slug/addevent'
        },
        'agendaEventEdit' : {
          method: 'get',
          uri: '/:slug/event/:eventSlug/edit'
        },
        'agendaEventDuplicate' : {
          method: 'get',
          uri: '/:slug/event/:eventSlug/duplicate'
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
          uri: '/agendas/:uid.ics'
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
        'agendaAddAsSource' : {
          method: 'get',
          uri: '/agenda/:uid/aggregator/addTo/:aggUid'
        },
        'agendaRemoveAsSource' : {
          method: 'get',
          uri: '/agenda/:uid/aggregator/removeFrom/:aggUid'
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
        'agendaAdminModerators' : {
          method: 'get',
          uri: '/:slug/admin/moderators'
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
        'eventDuplicate' : {
          method: 'get',
          uri: '/event/:eventSlug/duplicate'
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
        'conversationDiscussion' : {
          method: 'get',
          uri: '/messages/new?uuid=:uid&redirect=:redirect'
        },
        'conversationAgendaContact' : {
          method: 'get',
          uri: '/messages/new?type=7&aUid=:uid'
        },
        'conversationEventClaim' : {
          method: 'get',
          uri: '/messages/new?type=2&slug=:eventSlug'
        },
        'conversationEventSignal' : {
          method: 'get',
          uri: '/messages/new?type=4&slug=:eventSlug'
        }
      },
      defaultGlobalsPrefix: ''
    }
  },

  dev: {
    domain: 'd.openagenda.com',
    root: 'https://d.openagenda.com',
    env: 'dev',
    multiCore: false,
    mainChannel: 'maindev',
    logNameSpaces: 'oa:*',
    logEntriesToken: 'a2923436-55dc-4eba-8668-44824d11c089',
    //useCache: false,
    db: {
      database: 'oadev',
      host: 'localhost',
      user: 'root',
      password: 'grut',
      cache: true
    },
    auth: {
      local: {
        useCaptcha: true,
        captchaKey: '6Lee0QMTAAAAAI0t5qoDO_Iduxe-4-oJe3HhggcR',
        captchaSecret: '6Lee0QMTAAAAAGtqf0sUO8LNVNboDVZ9pQBN5cFA'
      },
      facebook: {
        id: '1008853945821827',
        secret: '243737ef67adf832bf1c25c54717ed41'
      },
      twitter: {
        key: 'hMcfdN7tfpzdfvTAeGUQ',
        secret: 'TgyJQUQTNORR3RSARNznICg9xYIs7eAWr7ONNs70nc'
      },
      google : {
        id: '493901398908-njdc3qepd1j08arb37ptb8okhm6klu05.apps.googleusercontent.com',
        secret: 'VmmU8IWHXKT_BGXghqrvFyXI'
      }
    },
    es: {
      host: 'localhost',
      port : 9200,
      indexName : 'cibuldev',
      channel : 'maindev'
    },
    redis: {
      host: 'localhost',
      port: 6379
    },
    mailer: {
      service: 'dud',
      simulated: true // legacy ./mailer
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
      imageBucketPath: 'https://cibuldev.s3.amazonaws.com/',
      tmpBucketPath: 'https://cibuldevtmp.s3.amazonaws.com/',
      staticBucketPath: 'https://cibulstatic.s3.amazonaws.com/',
      bucket: 'cibuldev',
      tmpBucket: 'cibuldevtmp'
    },
    bridges: {
      swapcard: {
        redirect: 'http://d.openagenda.com/services/swapcard/connect/callback',
        clientID: '5_2teox6oxnwg0k4cscwwk8gs84cwo0ococck0og4wkswwwc4ggc',
        clientSecret: '4ze5s2xa5y4g48kw0wow8sg8ssc4wcg0kcc8gwks8coww4ssos',
        token: 'ZmI4YzlhMzFlZGY3ODdkZjg3MzU3YTUxN2MxYmRjNmMwNTdmZGFkM2RlNGE5N2Q3YTBkOWU1NmY2YjI1ZWExMQ',
        baseSite: 'https://apidev.swapcard.com'
      }
    }
  },
  
  test: {
    env: 'test',
    multiCore: false,
    mainChannel: 'maintest',
    logNameSpaces: false,
    logEntriesToken: false,
    root: 'https://d.openagenda.com',
    domain: 'd.openagenda.com',
    db: {
      database: 'oatest',
      host: 'localhost',
      user: 'root',
      password: 'grut'
    },
    auth: {
      local: {
        useCaptcha: false
      },
      facebook: {
        id: '160151044018305',
        secret: '12f736eeec5b1be1ee3bf5705e65aa7a',
        testAccount: {
          email: 'gaetan@cibul.net',
          password: 'cibulon'
        }
      },
      twitter: {
        key: 'hMcfdN7tfpzdfvTAeGUQ',
        secret: 'TgyJQUQTNORR3RSARNznICg9xYIs7eAWr7ONNs70nc',
        testAccount: {
          email: 'gaetan@cibul.net',
          password: 'cibulon',
          id: 341470576
        }
      },
      google : {
        id: '493901398908-njdc3qepd1j08arb37ptb8okhm6klu05.apps.googleusercontent.com',
        secret: 'VmmU8IWHXKT_BGXghqrvFyXI',
        testAccount: {
          email: 'gaetanlatouche79@gmail.com',
          password: 'cibulon79',
          id: 110557384511109386749
        }
      }
    },
    es: {
      host: 'localhost',
      port : 9200,
      indexName : 'cibultest',
      channel : 'maintest'
    },
    routes: {
      defaultGlobalsPrefix: '/frontend_test.php'
    },
    redis: {
      host: 'localhost',
      port: 6379
    },
    mailer: {
      service: 'dud',
      simulated: true // legacy ./mailer
    },
    aws: {
      accessKeyId: 'AKIAJCTNQBIZSAPX7HUQ',
      secretAccessKey: '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',
      region: 'eu-west-1',
      tmpBucketPath: 'https://cibultesttmp.s3.amazonaws.com/',
      imageBucketPath: 'https://cibultest.s3.amazonaws.com/',
      staticBucketPath: 'https://cibulstatic.s3.amazonaws.com/',
      bucket: 'cibultest',   
      tmpBucket: 'cibultesttmp'
    },
  },
  
  prod: {}
};

var currentConfig = _loadEnv( process.env.NODE_ENV || 'dev' );

currentConfig.loadEnv = _loadEnv;


/**
 * emailstrategie database configuration
 */

currentConfig.emailStrategieDb = deepExtend( {}, currentConfig.db, {
  database: 'emailStrategie' + ( process.env.NODE_ENV !== 'prod' ? process.env.NODE_ENV : '' )
} );

module.exports = currentConfig;

function _loadEnv( env ) {

  return deepExtend( currentConfig ? currentConfig : {}, config.all, config[env] )

}
