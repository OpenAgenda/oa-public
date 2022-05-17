'use strict';

const fs = require('fs');
const _ = require('lodash');
const debug = require('debug');

const prod = require('./prod');

let currentConfig;

const config = {
  all: {
    env: 'production',
    corpoLastUpdate: '2017-10-31T12:07:29.000Z',
    superAdminIds: [1, 2, 11258, 15453, 124500, 149412, 147323],
    jsVersion: 42,
    cssVersion: 2,
    interfaceLanguages: ['fr', 'en', 'de', 'es', 'it', 'br'],
    port: 8901 || process.env.OA_PORT,
    apiPort: 8902 || process.env.OA_API_PORT,
    multiCore: true,
    mainChannel: 'main',
    jobsQueue: 'jobs',
    queues: {
      aggregator: 'aggregator',
      oembed: 'oembed',
      controlData: 'agendaControlDataQueue',
      stakeholderCreate: 'stakeholderCreate',
      notificationAddActivity: 'notificationAddActivity',
      notificationSendSummary: 'notificationSendSummary',
      inboxesSync: 'inboxesSync'
    },
    agendaSearchRecentThreshold: parseInt(process.env.AGENDA_SEARCH_RECENT_THRESHOLD_DAYS || 14, 10),
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
      token: prod.insightOps && prod.insightOps.main || null,
      errorsTracking: {
        insightOpsKey: prod.insightOps && prod.insightOps.clientErrors || null,
        sentryDsn: prod.sentry && prod.sentry.dsn || null
      }
    },
    name: 'cibul-node',
    domain: prod.domains ? prod.domains.main : process.env.OA_DOMAIN,
    root: prod.root || process.env.OA_ROOT,
    apiRoot: prod.apiRoot || process.env.API_ROOT,
    apiDomain: prod.apiDomain || process.env.API_DOMAIN,
    logo: prod.logo,
    googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID || (prod.googleAnalytics && prod.googleAnalytics.id),
    embedGoogleAnalyticsId: process.env.GOOGLE_ANALYTICS_EMBED_ID || (prod.googleAnalytics && prod.googleAnalytics.embedId),
    matomoCloudId: process.env.MATOMO_CLOUD_ID || prod.matomoCloudId,
    useCache: false,
    agendaCacheExpire: 30 * 1000,
    shares: {
      agenda: ['twitter', 'facebook', 'googlePlus', 'linkedIn']
    },
    adminEmail: 'admin@openagenda.com',
    callToActionEmails: prod.sales && prod.sales.emails,
    contactResource: prod.sales && prod.sales.pipedriveForm,
    tiles: prod.tiles || process.env.MAP_TILES,
    staticTiles: prod.staticTiles || process.env.STATIC_MAP_TILES,
    opencage: {
      key: process.env.OPENCAGE_KEY || prod.opencage && prod.opencage.key
    },
    db: {
      database: prod.db && prod.db.name,
      host: prod.db && prod.db.host,
      port: prod.db && prod.db.port,
      user: prod.db && prod.db.user,
      password: prod.db && prod.db.password,
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
    mtCaptcha: {
      enabled: !!prod.mtCaptcha,
      verifyUrl: prod.mtCaptcha?.verifyUrl,
      siteKey: prod.mtCaptcha?.siteKey,
      privateKey: prod.mtCaptcha?.privateKey,
    },
    auth: {
      facebook: prod.facebook && {
        id: prod.facebook.appId,
        secret: prod.facebook.appSecret
      } || null,
      twitter: prod.twitter && {
        key: prod.twitter.key,
        secret: prod.twitter.secret
      } || null,
      google: prod?.googleApps || process.env.OA_OAUTH_GOOGLE_ID ? {
        id: prod?.googleApps?.id || process.env.OA_OAUTH_GOOGLE_ID,
        secret: prod?.googleApps?.secret || process.env.OA_OAUTH_GOOGLE_SECRET
      } : null,
    },
    discord: prod.discord || {
      token: process.env.OA_DISCORD_TOKEN,
      channel: process.env.OA_DISCORD_CHANNEL
    },
    crisp: prod.crisp || process.env.CRISP_WEBSITE_ID,
    es: {
      host: process.env.LEGACY_ES_HOST || (prod.elasticsearch && prod.elasticsearch.v1_3.host),
      port: prod.elasticsearch ? prod.elasticsearch.v1_3.port : 9200,
      indexName: prod.elasticsearch ? prod.elasticsearch.indices.legacyEvents : 'cibul',
      channel: 'main'
    },
    es75: prod.elasticsearch ? prod.elasticsearch.v7_5 : null,
    esEvents: {
      maxIndexableTimingCount: 3000
    },
    agendaSearchAlias: process.env.OA_AGENDA_SEARCH_ALIAS || prod.agendaSearchAlias || 'agendas',
    redis: {
      host: _.get(prod, 'redis.host', 'localhost'),
      port: _.get(prod, 'redis.port', 6379)
    },
    locationDuplicationDetection: {
      enabled: prod.detectLocationDuplicates ?? (!!process.env.OA_DETECT_LOCATION_DUPLICATES),
      ignoredUids: {
        setUids: prod.detectLocationDuplicatesIgnoredSetUids ?? (process.env.OA_DETECT_LOCATION_DUPLICATES_IGNORED_SET_UIDS ?? '').split(',').map(i => parseInt(i, 10)),
        agendaUids: prod.detectLocationDuplicatesIgnoredAgendaUids ?? (process.env.OA_DETECT_LOCATION_DUPLICATES_IGNORED_AGENDA_UIDS ?? '').split(',').map(i => parseInt(i, 10)),
      },
      sleep: prod.detectLocationDuplicatesSleep ?? (process.env.OA_DETECT_LOCATION_DUPLICATES_SLEEP ? parseInt(process.env.OA_DETECT_LOCATION_DUPLICATES_SLEEP, 10) : 0),
    },
    session: {
      name: 'oa', // session cookie name
      writableName: 'oa.rw', // store client-editable data
      keys: prod.session ? prod.session.keys : process.env.OA_SESSION_KEYS.split(','),
      secret: prod.session ? prod.session.secret : process.env.OA_SESSION_SECRET,
      maxAge: 1000 * 60 * 60 * 48,
      httpOnly: false,
      namespace: 'sessions',
      signed: true,
      secure: true
    },
    cookie: {
      name: 'cibul'
    },
    blacklistedDomains: [
      'getnada.com',
      'intrees.org',
      'luxusmail.gq',
      'kweekendci.com',
      'truthfinderlogin.com',
      'temporary-mail.net',
      'besttempmail.com',
      'powerencry.com',
      'truthfinderlogin.com',
      'wellsfargocomcardholders.com',
      'chasefreedomactivate.com',
      'eoopy.com'
    ],
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
      accessKeyId: prod.aws && prod.aws.key,
      secretAccessKey: prod.aws && prod.aws.secret,
      region: 'eu-west-1',
      imageBucketPath: prod.aws && `https://${prod.aws.buckets.main}.s3.amazonaws.com/`,
      tmpBucketPath: prod.aws && `https://${prod.aws.buckets.temporary}.s3.amazonaws.com/`,
      staticBucketPath: prod.aws && `https://${prod.aws.buckets.static}.s3.amazonaws.com/`,
      servicesBucketPath: prod.aws && `https://${prod.aws.buckets.services}.s3.amazonaws.com/`,
      bucket: prod.aws && prod.aws.buckets.main,
      tmpBucket: prod.aws && prod.aws.buckets.temporary,
      defaultImagePath: process.env.OA_DEFAULT_IMAGE_PATH || `//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png`,
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
      apiKey: prod.mailjet && prod.mailjet.apiKey,
      apiSecret: prod.mailjet && prod.mailjet.apiSecret,
      contactsListId: prod.mailjet && prod.mailjet.contactsListId
    },
    mailgun: {
      domain: prod.mailgun && prod.mailgun.domain,
      apiKey: prod.mailgun && prod.mailgun.apiKey
    },
    oembed: {
      res: 'https://iframe.ly/api/oembed',
      //key: '044c4cbd91d65eab056738',
      //key: '32d62d210e9dcf24c0134e',
      key: process.env.IFRAMELY_KEY || (prod.iframely && prod.iframely.key),
      platforms: [
        "dropbox",
        "wemap",
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
        "eventbrite",
        "pictoaccess",
        "twitch\\.tv",
        "arte\\.tv"
      ],
    },
    newsletter: {
      featuredLimit: 10,  // maximum number of featured events displayable in the same newsletter campaign
      selectionLimit: 30  // maximum number of events displayable in the selection of a newsletter campaign
    },
    twitter: {
      name: prod.twitter && prod.twitter.name
    },
    maxFileSize: 20000000,
    imageSizeLimits: [2000, 30000000],
    comexposium: {
      contributingAgendaUid: 63430882 // le salon de l'agriculture - deprecated
    },
    translators: prod?.translators ?? [],
    routes: {
      globals: {
        agendaFeed: {
          method: 'get',
          uri: '/agendas/:uid.atom',
          legacy: true
        },
        agendaCsv: {
          method: 'get',
          uri: '/agendas/:uid.csv',
          legacy: true
        },
        agendaAdminWeb: {
          method: 'get',
          uri: '/:slug/admin/webembed',
          legacy: true
        },
        agendaAdminShow: {
          method: 'get',
          uri: '/:slug/admin/events'
        },
        agendaEventAdminNavigate: {
          method: 'get',
          uri: '/:slug/admin/events/navigate'
        },
        signup: {
          method: 'get',
          uri: '/signup'
        },
        homeInboxConversation: {
          method: 'get',
          uri: '/home/inbox/conversation/:conversationId'
        },
        searchEvent: {
          method: 'get',
          uri: '/events/search'
        },
        agendaAdminInbox: {
          method: 'get',
          uri: '/:slug/admin/inbox'
        },
        agendaAdminInboxConversation: {
          method: 'get',
          uri: '/:slug/admin/inbox/conversation/:conversationId'
        },
        agendaSettingsEditApp: {
          method: 'get',
          uri: '/:slug/admin/settings'
        },
        customizedShow: {
          method: 'get',
          uri: '/:slug/admin/settings/customize'
        },
        eventShow: {
          method: 'get',
          uri: '/events/:eventSlug'
        },
        eventActionDatesShow: {
          method: 'get',
          uri: '/events/:eventSlug/action/dates'
        },
        agendaEventActionShow: {
          method: 'get',
          uri: '/:slug/events/:eventSlug/action'
        },
        agendaEventActionDatesShow: {
          method: 'get',
          uri: '/:slug/events/:eventSlug/action/dates'
        },
        agendaEventMailSend: {
          method: 'post',
          uri: '/:slug/events/:eventSlug/email'
        },
        agendaEventIcsShow: {
          method: 'get',
          uri: '/:slug/events/:eventSlug/ics'
        },
        facebookSignin: {
          method: 'get',
          uri: '/facebook/signin'
        },
        agendaFacebookSignin: {
          method: 'post',
          uri: '/:slug/facebook/signin'
        },
        facebookSigninCallback: {
          method: 'get',
          uri: '/facebook/signin/callback'
        },
        facebookSignup: {
          method: 'get',
          uri: '/facebook/signup'
        },
        agendaFacebookSignup: {
          method: 'post',
          uri: '/:slug/facebook/signup'
        },
        facebookSignupCallback: {
          method: 'get',
          uri: '/facebook/signup/callback'
        },
        twitterSignin: {
          method: 'post',
          uri: '/twitter/signin'
        },
        agendaTwitterSignin: {
          method: 'get',
          uri: '/:slug/twitter/signin'
        },
        twitterSigninCallback: {
          method: 'get',
          uri: '/twitter/signin/callback'
        },
        twitterSignup: {
          method: 'post',
          uri: '/twitter/signup'
        },
        agendaTwitterSignup: {
          method: 'get',
          uri: '/:slug/twitter/signup'
        },
        twitterEmail: {
          method: 'get',
          uri: '/twitter/email'
        },
        agendaTwitterEmail: {
          method: 'post',
          uri: '/:slug/twitter/email'
        },
        twitterSignupCallback: {
          method: 'get',
          uri: '/twitter/signup/callback'
        },
        googleSignin: {
          method: 'get',
          uri: '/google/signin'
        },
        agendaGoogleSignin: {
          method: 'post',
          uri: '/:slug/google/signin'
        },
        googleSigninCallback: {
          method: 'get',
          uri: '/google/signin/callback'
        },
        googleSignup: {
          method: 'get',
          uri: '/google/signup'
        },
        agendaGoogleSignup: {
          method: 'post',
          uri: '/:slug/google/signup'
        },
        googleSignupCallback: {
          method: 'get',
          uri: '/google/signup/callback'
        },
        lostPassword: {
          method: 'get',
          uri: '/password/lost'
        },
        lostPasswordSubmit: {
          method: 'post',
          uri: '/password/lost'
        },
        resetPassword: {
          method: 'get',
          uri: '/password/reset/:token'
        },
        contributorsInfo: {
          method: 'get',
          uri: '/:slug/admin/contributors/info'
        },
        eventTransfer: {
          method: 'get',
          uri: '/:slug/admin/contributors/transfer/:eventSlug'
        },
        emailStrategieNew: {
          method: 'get',
          uri: '/:slug/admin/emailstrategie/new'
        },
        emailStrategieNewSubmit: {
          method: 'post',
          uri: '/:slug/admin/emailstrategie/new'
        },
        emailStrategieShow: {
          method: 'get',
          uri: '/:slug/admin/emailstrategie'
        },
        emailStrategiePush: {
          method: 'post',
          uri: '/:slug/admin/emailstrategie/push'
        },
        emailStrategieUnlink: {
          method: 'get',
          uri: '/:slug/admin/emailstrategie/unlink'
        },
        agendaAdminLocations: {
          method: 'get',
          uri: '/:slug/admin/locations'
        },
        agendaAdminLocationsCsv: {
          method: 'get',
          uri: '/:slug/admin/locations/exports.csv'
        },
        agendaLocationSet: {
          method: 'post',
          uri: '/:slug/locations'
        },
        agendaAdminLocationSet: {
          method: 'post',
          uri: '/:slug/admin/locations'
        },
        agendaAdminLocationRemove: {
          method: 'post',
          uri: '/:slug/admin/locations/remove'
        },
        agendaAdminLocationMerge: {
          method: 'post',
          uri: '/:slug/admin/locations/merge'
        },
        agendaAdminLocationTerms: {
          method: 'get',
          uri: '/:slug/admin/locations/terms'
        },
        locationGeocode: {
          method: 'get',
          uri: '/:slug/locations/geocode'
        },
        locationINSEE: {
          method: 'get',
          uri: '/:slug/locations/insee'
        },
        locationReverseGeocode: {
          method: 'get',
          uri: '/:slug/locations/geocode/reverse'
        },
        locationResync: {
          method: 'get',
          uri: '/:slug/admin/locations/resync'
        },
        locationToVerifyCount: {
          method: 'get',
          uri: '/:slug/admin/locations/verifycount'
        },
        locationNewImageUpload: {
          method: 'post',
          uri: '/:slug/locations/image'
        },
        locationNewImageRemove: {
          method: 'post',
          uri: '/:slug/locations/image/remove'
        },
        locationImageUpload: {
          method: 'post',
          uri: '/:slug/locations/:locationUid/image'
        },
        locationImageRemove: {
          method: 'post',
          uri: '/:slug/locations/:locationUid/image/remove'
        },
        agendaLocationGet: {
          method: 'get',
          uri: '/:slug/locations/:locationUid'
        },
        agendaAdminMembers: {
          method: 'get',
          uri: '/:slug/admin/members'
        },
        agendaAdminActivityApps: {
          method: 'get',
          uri: '/:slug/admin/activities'
        },
        agendaEmbedShow: {
          method: 'get',
          uri: '/agendas/:uid/embed/events'
        },
        customEmbedShow: {
          method: 'get',
          uri: '/agendas/:uid/embeds/:embedUid/events'
        },
        customEmbedShowPreview: {
          method: 'get',
          uri: '/agendas/:uid/previewEmbeds/:embedUid/events'
        },
        agendaSearch: {
          method: 'get',
          uri: '/agendas'
        },
        agendaRedirect: {
          method: 'get',
          uri: '/agendas/:uid'
        },
        agendaShowPrivate: {
          method: 'get',
          uri: '/:slug.prv'
        },
        agendaShow: {
          method: 'get',
          uri: '/:slug'
        },
        facebookShow: {
          method: 'get',
          uri: '/:slug/admin/facebook'
        },
        agendaActionShow: {
          method: 'get',
          uri: '/:slug/actions'
        },
        agendaEventAdd: {
          method: 'get',
          uri: '/:slug/actions/add/:eventUid'
        },
        agendaEventRemove: {
          method: 'get',
          uri: '/:slug/actions/remove/:eventUid'
        },
        agendaJsonEvents: {
          method: 'get',
          uri: '/agendas/:uid/events.json'
        },
        agendaCsvEvents: {
          method: 'get',
          uri: '/agendas/:uid/events.csv'
        },
        agendaPdfEvents: {
          method: 'get',
          uri: '/agendas/:uid/events.pdf'
        },
        agendaXlsxEvents: {
          method: 'get',
          uri: '/agendas/:uid/events.xlsx'
        },
        agendaRssEvents: {
          method: 'get',
          uri: '/agendas/:uid/events.rss'
        },
        agendaIcsEvents: {
          method: 'get',
          uri: '/agendas/:uid/events.ics'
        }
      }
    }
  },

  development: {
    domain: process.env.OA_DOMAIN || 'd.openagenda.com',
    root: process.env.OA_ROOT || 'https://d.openagenda.com',
    apiRoot: process.env.API_ROOT,
    apiDomain: process.env.API_DOMAIN,
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
        //enable: 'oa:agendaEvents',
        //enable: 'oa:services/event/oembed',
        //enable: 'oa:services/model',
        //enable: 'oa:events/interfaces*',
        //enable: 'oa:events*,oa:legacy*',
        //enable: 'oa:mailer/task/eventAggregation*',
        //enable: 'oa:legacy:*'
        //enable: 'oa:services/eventSearch/*,oa:uncaught,svc:*'
        //enable: 'oa:*,svc:*,-svc:mails/transporter'
        enable: 'oa:*',
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
      database: process.env.OA_MYSQL_DEV_DATABASE || 'oadev',
      host: process.env.OA_MYSQL_DEV_HOST || 'localhost',
      password: process.env.OA_MYSQL_DEV_PASSWORD || 'grut',
      user: process.env.OA_MYSQL_DEV_USER || 'root',
      cache: true,
      timezone: 'UTC',
      ssl: parseInt(process.env.OA_MYSQL_DEV_SSL_VERIFY, 10)
        ? {
          ca: fs.readFileSync(process.env.OA_MYSQL_DEV_SSL_CA),
          cert: fs.readFileSync(process.env.OA_MYSQL_DEV_SSL_CERT),
          key: fs.readFileSync(process.env.OA_MYSQL_DEV_SSL_KEY)
        }
        : true
    },
    reCaptcha: {
      enabled: !!prod.reCaptcha,
      verify: prod.reCaptcha && prod.reCaptcha.verify,
      v3: {
        key: '6LfMOpwUAAAAAJID3dgKjFyRVmK1tomtBK2Au8gH',
        secret: '6LfMOpwUAAAAAOaiGNVsooxicbF8w6yyQr2lh06-'
      },
      v2: {
        key: '6Lc3AsMZAAAAANj4c-HUIFj9Cv9iFAAhlVtTZj_k',
        secret: '6Lc3AsMZAAAAAHTv4CkkHrOWPm-5jDLrFiOrqhsk'
      },
      v2Invisible: {
        key: '6LcaKMMZAAAAAKys_2tpwE2N5805lp961CZymWAC',
        secret: '6LcaKMMZAAAAAKfQ6qv504FRtrALVf_lOWtSxfv9'
      }
    },
    auth: {
      facebook: {
        id: '1008853945821827',
        secret: '243737ef67adf832bf1c25c54717ed41'
      },
      twitter: {
        key: 'u9rxxAMJloDOHYQ87qpjTg55W',
        secret: 'kstpqny90OSAQuaqrblDJXtv51B6jO4NO8j3TbdgErZa5RyDDt'
      },
      google: {
        id: process.env.OA_OAUTH_GOOGLE_ID,
        secret: process.env.OA_OAUTH_GOOGLE_SECRET
      }
    },
    discord: {
      token: process.env.OA_DISCORD_TOKEN,
      channel: process.env.OA_DISCORD_CHANNEL
    },
    es: {
      host: process.env.OA_ELASTICSEARCH_134_DEV_HOST || 'localhost',
      port: process.env.OA_ELASTICSEARCH_134_DEV_PORT || 9200,
      indexName: 'cibuldev',
      channel: 'maindev',
      ssl: process.env.OA_ELASTICSEARCH_134_DEV_USE_SSL ? {
        key: fs.readFileSync(process.env.OA_CLIENT_SSL_KEY, 'utf-8'),
        cert: fs.readFileSync(process.env.OA_CLIENT_SSL_CERT, 'utf-8')
      } : null
    },
    es75: {
      host: process.env.OA_ELASTICSEARCH_750_DEV_HOST || 'localhost',
      port: process.env.OA_ELASTICSEARCH_750_DEV_PORT || 9207,
      protocol: process.env.OA_ELASTICSEARCH_750_DEV_PROTOCOL,
      ssl: process.env.OA_ELASTICSEARCH_750_DEV_USE_SSL ? {
        key: fs.readFileSync(process.env.OA_CLIENT_SSL_KEY, 'utf-8'),
        cert: fs.readFileSync(process.env.OA_CLIENT_SSL_CERT, 'utf-8')
      } : null
    },
    redis: {
      host: process.env.OA_REDIS_DEV_HOST || 'localhost',
      port: process.env.OA_REDIS_DEV_PORT || 6379
    },
    mails: {
      transport: {
        host: process.env.MAILCATCHER_HOST || '127.0.0.1',
        port: process.env.MAILCATCHER_PORT || '1025', // Mailcatcher port
      },
      disableVerify: true
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
    reCaptcha: {
      enabled: false
    },
    auth: {
      facebook: {
        id: '160151044018305',
        secret: '12f736eeec5b1be1ee3bf5705e65aa7a'
      },
      twitter: {
        key: 'hMcfdN7tfpzdfvTAeGUQ',
        secret: 'TgyJQUQTNORR3RSARNznICg9xYIs7eAWr7ONNs70nc'
      },
      google: {
        id: null,
        secret: null
      }
    },
    es: {
      host: 'localhost',
      port: 9200,
      indexName: 'cibultest',
      channel: 'maintest'
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
      transport: prod.mails && prod.mails.transport
    }
  }
};

currentConfig = _loadEnv(process.env.NODE_ENV || 'development');

currentConfig.loadEnv = _loadEnv;

if (currentConfig.matomoCloudId) {
  currentConfig.matomoCloudCode = `
    var _paq = window._paq = window._paq || [];
    /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
    _paq.push(['disableCookies']);
    _paq.push(['trackPageView']);
    _paq.push(['enableLinkTracking']);
    (function() {
      var u="https://${currentConfig.matomoCloudId}/";
      _paq.push(['setTrackerUrl', u+'matomo.php']);
      _paq.push(['setSiteId', '1']);
      var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
      g.async=true; g.src='//cdn.matomo.cloud/${currentConfig.matomoCloudId}/matomo.js'; s.parentNode.insertBefore(g,s);
    })();
  `;
}

/**
 * emailstrategie database configuration
 */

currentConfig.emailStrategieDb = _.merge({}, currentConfig.db, {
  database: 'emailStrategie' + (process.env.NODE_ENV !== 'production' ? process.env.NODE_ENV : '')
});

if (process.env.DEBUG) {
  currentConfig.logger.debug.enable = process.env.DEBUG;
}

debug.disable();
debug.enable(currentConfig.logger.debug.enable);

currentConfig.getLogConfig = (prefix, key, keyInPrefix = true) => ({
  debug: {
    prefix: keyInPrefix ? `${prefix}:${key}:` : `${prefix}:`
  },
  token: process.env.NODE_ENV !== 'production' ? null : prod.insightOps[key]
});


module.exports = currentConfig;


function _loadEnv(env) {

  return _.merge(currentConfig ? currentConfig : {}, config.all, config[env]);

}
