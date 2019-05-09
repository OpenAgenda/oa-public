"use strict";

const _ = require( 'lodash' );
const knexLib = require( 'knex' );
const redis = require( 'redis' );
const debug = require('debug');

const prod = require( './prod' );

let currentConfig;

const config = {
  all: {
    env: 'production',
    corpoLastUpdate: '2017-10-31T12:07:29.000Z',
    jsVersion: 42,
    cssVersion: 2,
    interfaceLanguages: [ 'fr', 'en', 'de', 'es' ],
    versions: {
      // unused for now
      members: [ {
        version: 2,
        createdAt: '2016-05-22T00:00:00.000Z',
        agendaUids: [
          47863189, // reed expo
          48959239, // la gargouille
          93961830, // jerusalem
          5897476,  // jerusalem
          96165479,
          11072140,
          41715612,
          28447894,
          27744304,
          56907207,
          26127587,
          73087674,
          63338236,
          47483234,
          19187305,
          33332852,
          66274790, // jerusalem
          72177774,
          67130267,
          68263389,
          2445326,
          19678829,
          49562322, // jerusalem
          61327284, // toujours jerusalem
          77097167, // Fête de la musique
          27437914,
          30456419,
          71115381,
          20168566,
          22946799,
          9343334,
          11919999,
          85229066,
          30453876,
          61665301 // ficepparis
        ]
      }, {
        version: 1
      } ]
    },
    port: 8901,
    apiPort: 8902,
    multiCore: true,
    mainChannel: 'main',
    jobsQueue: 'jobs',
    queues: {
      aggregator: 'aggregator',
      groupActions: 'groupactions',
      oembed: 'oembed',
      controlData: 'agendaControlDataQueue',
      stakeholderCreate: 'stakeholderCreate',
      stakeholderMessage: 'stakeholderMessage',
      notificationAddActivity: 'notificationAddActivity',
      notificationSendSummary: 'notificationSendSummary',
      inboxesSync: 'inboxesSync'
    },
    legacyQueue: 'bgestack',
    tmpFolderPath: '/var/tmp/',
    logPath: '/var/tmp/cibul-node.log',
    logPathDebug: '/var/tmp/cibul-node-debug.log',
    logPathError: '/var/tmp/cibul-node-errors.log',
    logger: {
      debug: {
        prefix: 'oa:',
        enable: false
      },
      token: prod.insightOps.main,
      errorsTracking: {
        insightOpsKey: prod.insightOps.clientErrors,
        sentryDsn: prod.sentry.dsn
      }
    },
    name: 'cibul-node',
    domain: prod.domains.main,
    root: prod.root,
    logo: prod.logo,
    googleAnalyticsId: prod.googleAnalytics.id,
    embedGoogleAnalyticsId: prod.googleAnalytics.embedId,
    externalScripts: {
      zendesk: prod.zendesk.widget
    },
    useCache: false,
    agendaCacheExpire: 30 * 1000,
    shares: {
      agenda: [ 'twitter', 'facebook', 'googlePlus', 'linkedIn' ]
    },
    adminEmail: 'admin@openagenda.com',
    callToActionEmails: prod.sales.emails,
    contactResource: prod.sales.pipedriveForm,
    mapboxAccessToken: prod.mapbox.token,
    geocodeFarm: {
      key: prod.geocodeFarm.key
    },
    opencage: {
      key: prod.opencage.key
    },
    db: {
      database: prod.db.name,
      host: prod.db.host,
      port: prod.db.port,
      user: prod.db.user,
      password: prod.db.password,
      cache: true,
      timezone: 'UTC',
      charset: 'utf8mb4'
    },
    schemas: {
      activity: 'activity',
      agenda: 'review',
      agendaEvent: 'review_article',
      agendaTag: 'review_tag',
      agendaCategory: 'review_category',
      agendaEventTag: 'review_tag_article',
      aggregator: 'aggregator',
      aggregatorSource: 'aggregator_source',
      apiKeySet: 'api_key_set',
      categorySet: 'category_set',
      conversationReviewerRequestInfo: 'conversation_reviewer_request_info',
      event: 'event',
      eventEditor: 'event_editor',
      eventReferences: 'agenda_event_reference',
      eventTranslation: 'event_translation',
      eventService: 'event_2',
      agendaEventService: 'agenda_event',
      eventLocationTranslation: 'event_location_translation',
      eventLocation: 'event_location',
      deleted: 'deleted',
      location: 'location',
      occurrence: 'occurrence',
      stakeholder: 'reviewer',
      stakeholderSettings: 'stakeholder_settings',
      tagSet: 'tag_set',
      user: 'user',
      userToken: 'user_token',
      legacyCredentialSet: 'review_credential',
      invitation: 'invitation_2', // new invitation
      unsubscribed: 'unsubscribed_2', // first unsubscribe addresses newsletter only
      feed: 'activity_feed',
      feed_activity: 'activity_feed_activity',
      feed_follow: 'activity_feed_follow',
      feed_notification: 'activity_feed_notification',
      key: 'key',
      inbox: 'inboxes_inbox',
      inboxUser: 'inboxes_inbox_user',
      conversation: 'inboxes_conversation',
      inboxConversation: 'inboxes_inbox_conversation',
      message: 'inboxes_message',
      messageAttachment: 'inboxes_message_attachment',
      rule: 'rule',
      unsubscriptionLink: 'unsubscription_link'
    },
    auth: {
      local: {
        useCaptcha: true,
        captchaKey: prod.googleCaptcha.key,
        captchaSecret: prod.googleCaptcha.secret,
        captchaVerify: prod.googleCaptcha.verify
      },
      facebook: {
        id: prod.facebook.appId,
        secret: prod.facebook.appSecret
      },
      twitter: {
        key: prod.twitter.key,
        secret: prod.twitter.secret
      },
      google: {
        id: prod.googleApps.id,
        secret: prod.googleApps.secret
      }
    },
    es: {
      host: process.env.LEGACY_ES_HOST || prod.elasticsearch.v1_3.host,
      port: prod.elasticsearch.v1_3.port,
      indexName: prod.elasticsearch.indices.legacyEvents,
      channel: 'main'
    },
    es53: {
      host: prod.elasticsearch.v5_3.host,
      port: prod.elasticsearch.v5_3.port
    },
    esLocation: {
      log: [ {
        type: 'stdio',
        level: [ 'error', 'warning' ]
      } ],
      index: prod.elasticsearch.indices.locations,
      apiVersion: '1.3',
      timeout: 30000
    },
    esEvents: {
      maxIndexableTimingCount: 3000
    },
    redis: {
      host: prod.redis.host,
      port: prod.redis.port
    },
    scriptRoutes: { // on prodifier server
      adminLocationReport: {
        port: 3000,
        host: '54.229.143.166',
        path: '/agendas/:agendaUid/locations/report/:userUid'
      }
    },
    session: {
      name: 'oa', // session cookie name
      writableName: 'oa.rw', // store client-editable data
      keys: prod.session.keys,
      secret: prod.session.secret,
      maxAge: 1000 * 60 * 60 * 48,
      httpOnly: false,
      namespace: 'sessions',
      signed: true,
      secure: true
    },
    cookie: {
      name: 'cibul'
    },
    mails: {
      defaults: {
        from: '"OpenAgenda" <no-reply@mail.openagenda.com>',
        replyTo: '"OpenAgenda" <admin@openagenda.com>'
      }
    },
    api: {
      redis: {
        prefix: 'apiKeySet:',
        publishCount: 'event/new/dayCount'
      }
    },
    aws: {
      accessKeyId: prod.aws.key,
      secretAccessKey: prod.aws.secret,
      region: 'eu-west-1',
      imageBucketPath: `https://${prod.aws.buckets.main}.s3.amazonaws.com/`,
      tmpBucketPath: `https://${prod.aws.buckets.temporary}.s3.amazonaws.com/`,
      staticBucketPath: `https://${prod.aws.buckets.static}.s3.amazonaws.com/`,
      servicesBucketPath: `https://${prod.aws.buckets.services}.s3.amazonaws.com/`,
      bucket: prod.aws.buckets.main,
      tmpBucket: prod.aws.buckets.temporary,
      defaultImagePath: `//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png`,
      oaLogoIcon: 'https://s3-eu-west-1.amazonaws.com/cibulstatic/logo_icon_300.jpg'
    },
    authorizedMimeTypes: {
      txt: 'text/plain',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      pdf: 'application/pdf',
      jpg: 'image/jpeg',
      csv: 'text/csv',
      doc: 'application/msword',
      odp: 'application/vnd.oasis.opendocument.presentation',
      ods: 'application/vnd.oasis.opendocument.spreadsheet',
      odt: 'application/vnd.oasis.opendocument.text',
      ppt: 'application/vnd.ms-powerpoint',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      xls: 'application/vnd.ms-excel'
    },
    uppy: {
      secret: 'DUy=dBGY1,(B]Yj'
    },
    mailjet: {
      apiKey: prod.mailjet.apiKey,
      apiSecret: prod.mailjet.apiSecret,
      contactsListId: prod.mailjet.contactsListId
    },
    mailgun: {
      domain: prod.mailgun.domain,
      apiKey: prod.mailgun.apiKey
    },
    oembed: {
      res: 'https://iframe.ly/api/oembed',
      //key: '044c4cbd91d65eab056738',
      //key: '32d62d210e9dcf24c0134e',
      key: prod.iframely.key,
      platforms: [
        "youtube",
        "dailymotion",
        "/day\.ly/",
        "vimeo",
        "soundcloud",
        "twitter\.com\/.+\/status\/[0-9]+$",
        "flickr",
        "instagram",
        "tumblr",
        "prezi",
        "google",
        "\\.ted\\.",
        "ina\\.fr",
        "youtu",
        "calameo",
        "allocine",
        "weezevent",
        "eventbrite"
      ],
    },
    newsletter: {
      featuredLimit: 10,  // maximum number of featured events displayable in the same newsletter campaign
      selectionLimit: 30  // maximum number of events displayable in the selection of a newsletter campaign
    },
    twitter: {
      name: prod.twitter.name
    },
    imageSizeLimits: [ 2000, 30000000 ],
    comexposium: {
      contributingAgendaUid: 63430882 // le salon de l'agriculture - deprecated
    },
    routes: {
      globals: {
        authShow: {
          method: 'get',
          uri: '/auth'
        },
        signup: {
          method: 'get',
          uri: '/signup'
        },
        homeMessages: {
          method: 'get',
          uri: '/home/messages'
        },
        homeNotifications: {
          method: 'get',
          uri: '/home/notifications'
        },
        homeInbox: {
          method: 'get',
          uri: '/home/inbox'
        },
        homeInboxConversation: {
          method: 'get',
          uri: '/home/inbox/conversation/:conversationId'
        },
        aboutShow: {
          method: 'get',
          uri: '/about'
        },
        termsShow: {
          method: 'get',
          uri: '/termsofuse'
        },
        searchEvent: {
          method: 'get',
          uri: '/events/search'
        },
        agendaNew: {
          method: 'get',
          uri: '/new'
        },
        agendaEventNew: {
          method: 'get',
          uri: '/:slug/addevent'
        },
        agendaEventEdit: {
          method: 'get',
          uri: '/:slug/event/:eventSlug/edit'
        },
        agendaEventDuplicate: {
          method: 'get',
          uri: '/:slug/event/:eventSlug/duplicate'
        },
        agendaEventShow: {
          method: 'get',
          uri: '/:slug/event/:eventSlug'
        },
        agendaFeed: {
          method: 'get',
          uri: '/agendas/:uid.atom'
        },
        agendaIcal: {
          method: 'get',
          uri: '/agendas/:uid.ics'
        },
        agendaCsv: {
          method: 'get',
          uri: '/agendas/:uid.csv'
        },
        agendaXml: {
          method: 'get',
          uri: '/agendas/:uid.xml'
        },
        agendaEmbedIndex: {
          method: 'get',
          uri: '/:slug/admin/webembed'
        },
        aggregatorCreate: {
          method: 'get',
          uri: '/agenda/:uid/aggregator/create'
        },
        agendaAddAsSource: {
          method: 'get',
          uri: '/agenda/:uid/aggregator/addTo/:aggUid'
        },
        agendaRemoveAsSource: {
          method: 'get',
          uri: '/agenda/:uid/aggregator/removeFrom/:aggUid'
        },
        agendaShowByUid: {
          method: 'get',
          uri: '/agendas/:uid'
        },
        agendaAdminShow: {
          method: 'get',
          uri: '/:slug/admin'
        },
        agendaEventAdminNavigate: {
          method: 'get',
          uri: '/:slug/admin/navigate'
        },
        agendaAdminContributors: {
          method: 'get',
          uri: '/:slug/admin/contributors'
        },
        agendaAdminDataviz: {
          method: 'get',
          uri: '/:slug/admin/dataviz'
        },
        agendaAdminWeb: {
          method: 'get',
          uri: '/:slug/admin/webembed'
        },
        agendaAdminIndesign: {
          method: 'get',
          uri: '/:slug/admin/xml'
        },
        agendaAdminFacebook: {
          mathod: 'get',
          uri: '/:slug/admin/facebook'
        },
        agendaAdminAdministrators: {
          method: 'get',
          uri: '/:slug/admin/admins'
        },
        agendaAdminModerators: {
          method: 'get',
          uri: '/:slug/admin/moderators'
        },
        agendaAdminTheme: {
          method: 'get',
          uri: '/:slug/admin/edit'
        },
        agendaAdminSettings: {
          method: 'get',
          uri: '/:slug/admin/edit'
        },
        agendaAdminInbox: {
          method: 'get',
          uri: '/:slug/admin/inbox'
        },
        agendaAdminInboxConversation: {
          method: 'get',
          uri: '/:slug/admin/inbox/conversation/:conversationId'
        },
        eventShow: {
          method: 'get',
          uri: '/events/:eventSlug'
        },
        eventShare: {
          method: 'get',
          uri: '/share/event/:eventSlug'
        },
        eventEdit: {
          method: 'get',
          uri: '/event/:eventSlug/edit'
        },
        eventDuplicate: {
          method: 'get',
          uri: '/event/:eventSlug/duplicate'
        },
        eventEmbedEdit: {
          method: 'get',
          uri: '/embed/event/:uid/edit'
        },
        eventRemove: {
          method: 'get',
          uri: '/event/:eventUid/remove'
        },
        eventCalendarShare: {
          method: 'get',
          uri: '/calendarexport/:eventSlug'
        },
        conversationDiscussion: {
          method: 'get',
          uri: '/messages/new?uuid=:uid&redirect=:redirect'
        },
        conversationAgendaContact: {
          method: 'get',
          uri: '/messages/new?type=7&aUid=:uid'
        },
        conversationEventClaim: {
          method: 'get',
          uri: '/messages/new?type=2&slug=:eventSlug'
        },
        conversationEventSignal: {
          method: 'get',
          uri: '/messages/new?type=4&slug=:eventSlug'
        },
        agendaContributorsCsv: {
          method: 'get',
          uri: '/:slug/admin/contributors.csv'
        },
        agendaContributorsXlsx: {
          method: 'get',
          uri: '/:slug/admin/contributors.xlsx'
        },
        publicEventContact: {
          method: 'get',
          uri: '/:slug/events/:eventSlug/contact'
        },
        adminEventContact: {
          method: 'get',
          uri: '/:slug/admin/events/:eventSlug/contact'
        },
        confirmChangeEmail: {
          method: 'get',
          uri: '/users/:uid/confirmChangeEmail'
        }
      },
      defaultGlobalsPrefix: ''
    }
  },

  development: {
    domain: 'd.openagenda.com',
    root: 'https://d.openagenda.com',
    env: 'development',
    multiCore: false,
    mainChannel: 'maindev',
    logger: {
      debug: {
        prefix: 'oa:',
        //enable: 'oa:controlData*,oa:services/agenda/task*, oa:services/aggregator*'
        //enable: 'oa:services/agenda/controlData*'
        //enable: 'oa:services/agenda/controlData*,oa:services/agenda/task*,oa:services/agenda/dispatcher*,oa:services/aggregator*',
        //enable: 'oa:services/agenda/controlData*,oa:services/aggregator/sources'
        //enable: 'oa:services/aggregator/*'
        //enable: 'oa:search task*',
        //enable: 'oa:events/interfaces/legacy'
        //enable: 'oa:agendaEvents/interfaces/legacy',
        //enable: 'oa:agendaEvents/interfaces/legacy, oa:agendaEvents/interfaces/onUpdate',
        //enable: 'oa:agendaEvents*, oa:events*, oa:services/eventSearch*, oa:groupactions*'
        //enable: 'oa:agendaEvents',
        //enable: 'oa:services/event/oembed',
        //enable: 'oa:services/model',
        //enable: 'oa:events/interfaces*',
        //enable: 'oa:events*,oa:legacy*',
        //enable: 'oa:mailer/task/eventAggregation*',
        //enable: 'oa:legacy:*'
        //enable: 'oa:services/eventSearch/*,oa:uncaught,svc:*'
        enable: 'oa:*'

        //enable: 'oa:services/agenda/dispatcher'
        //enable: 'oa:*,svc:*',
        //enable: 'events/interfaces/legacy',
        //enable: 'oa:services/aggregator/evaluate'
        //enable: 'svc:*'
      },
      token: false // no need to log dev things
      //token: 'a2923436-55dc-4eba-8668-44824d11c089'
    },
    //useCache: false,
    db: {
      database: 'oadev',
      //database: 'ville_de_geneve',
      host: 'localhost',
      user: 'root',
      /*
      host: 'ec2-54-195-244-5.eu-west-1.compute.amazonaws.com',
      user: 'dev',
      */
      password: 'grut',
      cache: true,
      //debug: true,
      timezone: 'UTC'
    },
    auth: {
      local: {
        useCaptcha: true,
        captchaKey: '6LfMOpwUAAAAAJID3dgKjFyRVmK1tomtBK2Au8gH',
        captchaSecret: '6LfMOpwUAAAAAOaiGNVsooxicbF8w6yyQr2lh06-'
      },
      facebook: {
        id: '1008853945821827',
        secret: '243737ef67adf832bf1c25c54717ed41'
      },
      twitter: {
        key: 'u9rxxAMJloDOHYQ87qpjTg55W',
        secret: 'kstpqny90OSAQuaqrblDJXtv51B6jO4NO8j3TbdgErZa5RyDDt'
      },
      google: {
        id: '493901398908-njdc3qepd1j08arb37ptb8okhm6klu05.apps.googleusercontent.com',
        secret: 'VmmU8IWHXKT_BGXghqrvFyXI'
      }
    },
    es: {
      host: process.env.ELASTICSEARCH_134_DEV_HOST || 'localhost',
      port: process.env.ELASTICSEARCH_134_DEV_PORT || 9200,
      indexName: 'cibuldev',
      channel: 'maindev'
    },
    es53: {
      host: process.env.ELASTICSEARCH_533_DEV_HOST || 'localhost',
      port: process.env.ELASTICSEARCH_533_DEV_PORT || 9205
    },
    redis: {
      host: 'localhost',
      port: 6379
    },
    mails: {
      transport: {
        host: '127.0.0.1',
        port: '1025', // Mailcatcher port
      },
      disableVerify: true
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
    }
  },

  test: {
    env: 'test',
    multiCore: false,
    mainChannel: 'maintest',
    logger: {
      debug: {
        prefix: 'oa:',
        enable: false
      },
      token: false
    },
    root: 'https://d.openagenda.com',
    domain: 'd.openagenda.com',
    db: {
      database: 'oatest',
      host: 'localhost',
      user: 'root',
      password: 'grut',
      timezone: 'UTC'
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
      google: {
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
      port: 9200,
      indexName: 'cibultest',
      channel: 'maintest'
    },
    routes: {
      defaultGlobalsPrefix: '/frontend_test.php'
    },
    redis: {
      host: 'localhost',
      port: 6379
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
    }
  },

  production: {
    mails: {
      transport: prod.mails.transport
    }
  }
};

currentConfig = _loadEnv( process.env.NODE_ENV || 'development' );

currentConfig.loadEnv = _loadEnv;


/**
 * emailstrategie database configuration
 */

currentConfig.emailStrategieDb = _.merge( {}, currentConfig.db, {
  database: 'emailStrategie' + (process.env.NODE_ENV !== 'production' ? process.env.NODE_ENV : '')
} );

currentConfig.knex = knexLib( {
  client: 'mysql',
  connection: currentConfig.db,
  pool: { min: 2, max: 20 }
} );

currentConfig.redisClient = redis.createClient( currentConfig.redis.port, currentConfig.redis.host );

if ( process.env.DEBUG ) {
  currentConfig.logger.debug.enable = process.env.DEBUG;
}

debug.disable();
debug.enable( currentConfig.logger.debug.enable );

currentConfig.getLogConfig = ( prefix, key, keyInPrefix = true ) => ( {
  debug: {
    prefix: keyInPrefix ? `${prefix}:${key}:` : `${prefix}:`
  },
  token: process.env.NODE_ENV !== 'production' ? null : prod.insightOps[ key ]
} );


module.exports = currentConfig;


function _loadEnv( env ) {

  return _.merge( currentConfig ? currentConfig : {}, config.all, config[ env ] );

}
