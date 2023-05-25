'use strict';

const fs = require('fs');
const debug = require('debug');
const sentry = require('@sentry/node');

const prod = require('./prod');
const loadMatomoCloudCode = require('./loadMatomoCloudCode');

const config = {
  env: process.env.NODE_ENV ?? 'development',
  corpoLastUpdate: '2017-10-31T12:07:29.000Z',
  superAdminIds: [1, 2, 11258, 15453, 124500, 149412, 147323],
  jsVersion: 42,
  cssVersion: 2,
  interfaceLanguages: ['fr', 'en', 'de', 'es', 'it', 'br'],
  nextPort: process.env.OA_NEXT_PORT || 8901,
  port: process.env.OA_SERVER_PORT || 8903,
  apiPort: process.env.OA_API_PORT || 8902,
  jobsQueue: 'jobs',
  enableMigrations: true,
  queues: {
    aggregator: 'aggregator',
    oembed: 'oembed',
    controlData: 'agendaControlDataQueue',
    stakeholderCreate: 'stakeholderCreate',
    notificationAddActivity: 'notificationAddActivity',
    notificationSendSummary: 'notificationSendSummary',
    inboxesSync: 'inboxesSync',
  },
  agendaSearchRecentThreshold: parseInt(process.env.AGENDA_SEARCH_RECENT_THRESHOLD_DAYS || 14, 10),
  legacyQueue: 'bgestack',
  tmpFolderPath: '/var/tmp/',
  logPath: '/var/tmp/cibul-node.log',
  logPathDebug: '/var/tmp/cibul-node-debug.log',
  logPathError: '/var/tmp/cibul-node-errors.log',
  logger: process.env.NODE_ENV === 'production' ? {
    prefix: 'oa:',
    enableDebug: false,
    token: prod.insightOps?.main ?? null,
    errorsTracking: {
      insightOpsKey: prod.insightOps?.clientErrors ?? null,
      sentryDsn: prod.sentry?.dsn ?? null,
    },
    sentry,
  } : {
    prefix: 'oa:',
    token: false,
  },
  name: 'cibul-node',
  domain: prod.domains?.main ?? (process.env.DOMAIN ?? 'd.openagenda.com'),
  root: prod.root ?? (process.env.ROOT ?? 'https://d.openagenda.com'),
  apiRoot: prod.apiRoot ?? process.env.API_ROOT,
  apiDomain: prod.apiDomain ?? process.env.API_DOMAIN,
  logo: prod.logo,
  googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID || (prod.googleAnalytics && prod.googleAnalytics.id),
  embedGoogleAnalyticsId: process.env.GOOGLE_ANALYTICS_EMBED_ID || (prod.googleAnalytics && prod.googleAnalytics.embedId),
  matomoCloudId: prod.matomoCloudId ?? process.env.MATOMO_CLOUD_ID,
  matomoCloudCode: loadMatomoCloudCode(prod.matomoCloudId ?? process.env.MATOMO_CLOUD_ID),
  useCache: false,
  agendaCacheExpire: 30 * 1000,
  shares: {
    agenda: ['twitter', 'facebook', 'googlePlus', 'linkedIn'],
  },
  adminEmail: 'admin@openagenda.com',
  callToActionEmails: prod.sales && prod.sales.emails,
  contactResource: prod.sales && prod.sales.pipedriveForm,
  tiles: prod.tiles || process.env.MAP_TILES,
  staticTiles: prod.staticTiles || process.env.STATIC_MAP_TILES,
  opencage: {
    key: prod.opencage?.key ?? process.env.OPENCAGE_KEY,
  },
  db: {
    database: process.env.MYSQL_DATABASE ?? prod.db?.name,
    host: process.env.MYSQL_HOST ?? prod.db?.host,
    port: process.env.MYSQL_PORT ?? prod.db?.port,
    user: process.env.MYSQL_USER ?? prod.db?.user,
    password: process.env.MYSQL_PASSWORD ?? prod.db?.password,
    cache: true,
    timezone: 'UTC',
    charset: 'utf8mb4',
    ssl: parseInt(process.env.MYSQL_SSL_VERIFY, 10) ? {
      ca: fs.readFileSync(process.env.MYSQL_SSL_CA),
      cert: fs.readFileSync(process.env.MYSQL_SSL_CERT),
      key: fs.readFileSync(process.env.MYSQL_SSL_KEY),
    } : undefined,
  },
  mails: {
    transport: prod.mails?.transport ?? {
      host: process.env.MAIL_HOST ?? '127.0.0.1',
      port: process.env.MAIL_PORT ?? '1025',
      secure: !!parseInt(process.env.MAIL_SECURE, 10),
      auth: process.env.MAIL_AUTH_USER ? {
        user: process.env.MAIL_AUTH_USER,
        pass: process.env.MAIL_AUTH_PASSWORD,
      } : undefined,
      maxMessages: Infinity,
      maxConnections: 5,
      rateLimit: 14,
      rateDelta: 1000,
    },
    disableVerify: !!process.env.MAIL_DISABLE_VERIFY,
    defaults: {
      from: '"OpenAgenda" <no-reply@mail.openagenda.com>',
      replyTo: '"OpenAgenda" <admin@openagenda.com>',
    },
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
    locationSet: 'location_set',
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
    unsubscriptionLink: 'unsubscription_link',
  },
  mtCaptcha: {
    enabled: !!prod.mtCaptcha,
    verifyUrl: prod.mtCaptcha?.verifyUrl,
    siteKey: prod.mtCaptcha?.siteKey,
    privateKey: prod.mtCaptcha?.privateKey,
  },
  auth: {
    facebook: prod.facebook?.appId ?? process.env.OA_FACEBOOK_ID ? {
      id: prod.facebook?.appId ?? process.env.OA_FACEBOOK_ID,
      secret: prod.facebook?.appSecret ?? process.env.OA_FACEBOOK_SECRET,
    } : null,
    twitter: prod.twitter?.key ?? process.env.OA_TWITTER_KEY ? {
      key: prod.twitter?.key ?? process.env.OA_TWITTER_KEY,
      secret: prod.twitter?.secret ?? process.env.OA_TWITTER_SECRET,
    } : null,
    google: prod.googleApps ?? process.env.OA_OAUTH_GOOGLE_ID ? {
      id: prod?.googleApps?.id ?? process.env.OA_OAUTH_GOOGLE_ID,
      secret: prod?.googleApps?.secret || process.env.OA_OAUTH_GOOGLE_SECRET,
    } : null,
  },
  discord: prod.discord ?? {
    token: process.env.OA_DISCORD_TOKEN,
    channel: process.env.OA_DISCORD_CHANNEL,
  },
  crisp: prod.crisp || process.env.CRISP_WEBSITE_ID,
  es75: prod.elasticsearch?.v7_5 ?? {
    host: process.env.ES_HOST ?? 'localhost',
    port: process.env.ES_PORT ?? 9207,
    protocol: process.env.ES_PROTOCOL,
    ssl: process.env.ES_USE_SSL ? {
      key: fs.readFileSync(process.env.CLIENT_SSL_KEY, 'utf-8'),
      cert: fs.readFileSync(process.env.CLIENT_SSL_CERT, 'utf-8'),
    } : null,
  },
  esEvents: {
    maxIndexableTimingCount: 3000,
  },
  agendaSearchAlias: process.env.OA_AGENDA_SEARCH_ALIAS || prod.agendaSearchAlias || 'agendas',
  redis: process.env.REDIS_CLUSTER_NODES ? {
    clusterMode: true,
    params: {
      rootNodes: process.env.REDIS_CLUSTER_NODES.split(',').map(node => ({
        url: node,
      })),
      defaults: {
        password: process.env.REDIS_PWD,
      },
    },
  } : {
    clusterMode: false,
    host: prod.redis?.host ?? (process.env.REDIS_HOST ?? 'localhost'),
    port: prod.redis?.port ?? (process.env.REDIS_PORT ?? 6379),
  },
  locationDuplicationDetection: {
    enabled: prod.detectLocationDuplicates ?? !!process.env.OA_DETECT_LOCATION_DUPLICATES,
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
    secure: true,
  },
  cookie: {
    name: 'cibul',
  },
  hsts: {
    maxAge: 63072000,
    includeSubDomains: true,
    preload: true,
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
    'eoopy.com',
    'teknowa.com',
    'xegge.com',
    'rubeshi.com',
  ],
  api: {
    redis: {
      prefix: 'apiKeySet:',
      publishCount: 'event/new/dayCount',
    },
  },
  aws: {
    accessKeyId: prod.aws?.key ?? process.env.AWS_KEY,
    secretAccessKey: prod.aws?.secret ?? process.env.AWS_SECRET,
    region: process.env.AWS_REGION ?? 'eu-west-1',
    imageBucketPath: prod.aws ? `https://${prod.aws.buckets.main}.s3.amazonaws.com/` : process.env.AWS_MAIN_PATH,
    tmpBucketPath: prod.aws ? `https://${prod.aws.buckets.temporary}.s3.amazonaws.com/` : process.env.AWS_TMP_PATH,
    staticBucketPath: prod.aws ? `https://${prod.aws.buckets.static}.s3.amazonaws.com/` : process.env.AWS_STATIC_PATH,
    servicesBucketPath: prod.aws ? `https://${prod.aws.buckets.services}.s3.amazonaws.com/` : process.env.AWS_SERVICES_PATH,
    bucket: prod.aws?.buckets?.main ?? process.env.AWS_MAIN_BUCKET,
    tmpBucket: prod.aws?.buckets.temporary ?? process.env.AWS_TMP_BUCKET,
    defaultImagePath: process.env.DEFAULT_IMAGE_PATH ?? '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png',
    defaultImageSize: {
      width: parseInt(process.env.DEFAULT_IMAGE_SIZE_WIDTH ?? '140', 10),
      height: parseInt(process.env.DEFAULT_IMAGE_SIZE_HEIGHT ?? '140', 10),
    },
    oaLogoIcon: 'https://s3-eu-west-1.amazonaws.com/cibulstatic/logo_icon_300.jpg',
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
    xls: 'application/vnd.ms-excel',
  },
  uppy: {
    secret: 'DUy=dBGY1,(B]Yj',
  },
  mailjet: {
    apiKey: process.env.MAILJET_KEY ?? prod.mailjet?.apiKey,
    apiSecret: process.env.MAILJET_SECRET ?? prod.mailjet?.apiSecret,
    contactsListId: process.env.MAILJET_CONTACTS_LIST_ID ?? prod.mailjet?.contactsListId,
  },
  mailgun: {
    domain: prod.mailgun?.domain ?? process.env.MAILGUN_DOMAIN,
    apiKey: prod.mailgun?.apiKey ?? process.env.MAILGUN_KEY,
  },
  oembed: {
    res: 'https://iframe.ly/api/oembed',
    key: process.env.IFRAMELY_KEY || (prod.iframely && prod.iframely.key),
    platforms: [
      'dropbox',
      'wemap',
      'youtube',
      'dailymotion',
      '/day\\.ly/',
      'vimeo',
      'soundcloud',
      'twitter\\.com\\/.+\\/status\\/[0-9]+$',
      'flickr',
      'instagram',
      'tumblr',
      'prezi',
      'google',
      '\\.ted\\.',
      'ina\\.fr',
      'youtu',
      'calameo',
      'allocine',
      'weezevent',
      'eventbrite',
      'pictoaccess',
      'twitch\\.tv',
      'arte\\.tv',
    ],
  },
  newsletter: {
    featuredLimit: 10, // maximum number of featured events displayable in the same newsletter campaign
    selectionLimit: 30, // maximum number of events displayable in the selection of a newsletter campaign
  },
  twitter: {
    name: prod.twitter && prod.twitter.name,
  },
  maxFileSize: 20000000,
  imageSizeLimits: [2000, 30000000],
  translators: prod?.translators ?? [],
  routes: {
    globals: {
      agendaFeed: {
        method: 'get',
        uri: '/agendas/:uid.atom',
        legacy: true,
      },
      agendaCsv: {
        method: 'get',
        uri: '/agendas/:uid.csv',
        legacy: true,
      },
      agendaAdminWeb: {
        method: 'get',
        uri: '/:slug/admin/webembed',
        legacy: true,
      },
      agendaAdminShow: {
        method: 'get',
        uri: '/:slug/admin/events',
      },
      agendaEventAdminNavigate: {
        method: 'get',
        uri: '/:slug/admin/events/navigate',
      },
      signup: {
        method: 'get',
        uri: '/signup',
      },
      homeInboxConversation: {
        method: 'get',
        uri: '/home/inbox/conversation/:conversationId',
      },
      searchEvent: {
        method: 'get',
        uri: '/events/search',
      },
      agendaAdminInbox: {
        method: 'get',
        uri: '/:slug/admin/inbox',
      },
      agendaAdminInboxConversation: {
        method: 'get',
        uri: '/:slug/admin/inbox/conversation/:conversationId',
      },
      agendaSettingsEditApp: {
        method: 'get',
        uri: '/:slug/admin/settings',
      },
      customizedShow: {
        method: 'get',
        uri: '/:slug/admin/settings/customize',
      },
      eventShow: {
        method: 'get',
        uri: '/events/:eventSlug',
      },
      facebookSignin: {
        method: 'get',
        uri: '/facebook/signin',
      },
      agendaFacebookSignin: {
        method: 'post',
        uri: '/:slug/facebook/signin',
      },
      facebookSigninCallback: {
        method: 'get',
        uri: '/facebook/signin/callback',
      },
      facebookSignup: {
        method: 'get',
        uri: '/facebook/signup',
      },
      agendaFacebookSignup: {
        method: 'post',
        uri: '/:slug/facebook/signup',
      },
      facebookSignupCallback: {
        method: 'get',
        uri: '/facebook/signup/callback',
      },
      twitterSignin: {
        method: 'post',
        uri: '/twitter/signin',
      },
      agendaTwitterSignin: {
        method: 'get',
        uri: '/:slug/twitter/signin',
      },
      twitterSigninCallback: {
        method: 'get',
        uri: '/twitter/signin/callback',
      },
      twitterSignup: {
        method: 'post',
        uri: '/twitter/signup',
      },
      agendaTwitterSignup: {
        method: 'get',
        uri: '/:slug/twitter/signup',
      },
      twitterEmail: {
        method: 'get',
        uri: '/twitter/email',
      },
      agendaTwitterEmail: {
        method: 'post',
        uri: '/:slug/twitter/email',
      },
      twitterSignupCallback: {
        method: 'get',
        uri: '/twitter/signup/callback',
      },
      googleSignin: {
        method: 'get',
        uri: '/google/signin',
      },
      agendaGoogleSignin: {
        method: 'post',
        uri: '/:slug/google/signin',
      },
      googleSigninCallback: {
        method: 'get',
        uri: '/google/signin/callback',
      },
      googleSignup: {
        method: 'get',
        uri: '/google/signup',
      },
      agendaGoogleSignup: {
        method: 'post',
        uri: '/:slug/google/signup',
      },
      googleSignupCallback: {
        method: 'get',
        uri: '/google/signup/callback',
      },
      lostPassword: {
        method: 'get',
        uri: '/password/lost',
      },
      lostPasswordSubmit: {
        method: 'post',
        uri: '/password/lost',
      },
      resetPassword: {
        method: 'get',
        uri: '/password/reset/:token',
      },
      contributorsInfo: {
        method: 'get',
        uri: '/:slug/admin/contributors/info',
      },
      eventTransfer: {
        method: 'get',
        uri: '/:slug/admin/contributors/transfer/:eventSlug',
      },
      agendaAdminLocations: {
        method: 'get',
        uri: '/:slug/admin/locations',
      },
      agendaAdminLocationsCsv: {
        method: 'get',
        uri: '/:slug/admin/locations/exports.csv',
      },
      agendaLocationSet: {
        method: 'post',
        uri: '/:slug/locations',
      },
      agendaAdminLocationSet: {
        method: 'post',
        uri: '/:slug/admin/locations',
      },
      agendaAdminLocationRemove: {
        method: 'post',
        uri: '/:slug/admin/locations/remove',
      },
      agendaAdminLocationMerge: {
        method: 'post',
        uri: '/:slug/admin/locations/merge',
      },
      agendaAdminLocationTerms: {
        method: 'get',
        uri: '/:slug/admin/locations/terms',
      },
      locationGeocode: {
        method: 'get',
        uri: '/:slug/locations/geocode',
      },
      locationINSEE: {
        method: 'get',
        uri: '/:slug/locations/insee',
      },
      locationReverseGeocode: {
        method: 'get',
        uri: '/:slug/locations/geocode/reverse',
      },
      locationResync: {
        method: 'get',
        uri: '/:slug/admin/locations/resync',
      },
      locationToVerifyCount: {
        method: 'get',
        uri: '/:slug/admin/locations/verifycount',
      },
      locationNewImageUpload: {
        method: 'post',
        uri: '/:slug/locations/image',
      },
      locationNewImageRemove: {
        method: 'post',
        uri: '/:slug/locations/image/remove',
      },
      locationImageUpload: {
        method: 'post',
        uri: '/:slug/locations/:locationUid/image',
      },
      locationImageRemove: {
        method: 'post',
        uri: '/:slug/locations/:locationUid/image/remove',
      },
      agendaLocationGet: {
        method: 'get',
        uri: '/:slug/locations/:locationUid',
      },
      agendaAdminMembers: {
        method: 'get',
        uri: '/:slug/admin/members',
      },
      agendaAdminActivityApps: {
        method: 'get',
        uri: '/:slug/admin/activities',
      },
      agendaEmbedShow: {
        method: 'get',
        uri: '/agendas/:uid/embed/events',
      },
      customEmbedShow: {
        method: 'get',
        uri: '/agendas/:uid/embeds/:embedUid/events',
      },
      customEmbedShowPreview: {
        method: 'get',
        uri: '/agendas/:uid/previewEmbeds/:embedUid/events',
      },
      agendaSearch: {
        method: 'get',
        uri: '/agendas',
      },
      agendaRedirect: {
        method: 'get',
        uri: '/agendas/:uid',
      },
      agendaShowPrivate: {
        method: 'get',
        uri: '/:slug.prv',
      },
      agendaShow: {
        method: 'get',
        uri: '/:slug',
      },
      facebookShow: {
        method: 'get',
        uri: '/:slug/admin/facebook',
      },
      agendaActionShow: {
        method: 'get',
        uri: '/:slug/actions',
      },
      agendaEventAdd: {
        method: 'get',
        uri: '/:slug/actions/add/:eventUid',
      },
      agendaEventRemove: {
        method: 'get',
        uri: '/:slug/actions/remove/:eventUid',
      },
      agendaJsonEvents: {
        method: 'get',
        uri: '/agendas/:uid/events.json',
      },
      agendaCsvEvents: {
        method: 'get',
        uri: '/agendas/:uid/events.csv',
      },
      agendaPdfEvents: {
        method: 'get',
        uri: '/agendas/:uid/events.pdf',
      },
      agendaXlsxEvents: {
        method: 'get',
        uri: '/agendas/:uid/events.xlsx',
      },
      agendaRssEvents: {
        method: 'get',
        uri: '/agendas/:uid/events.rss',
      },
      agendaIcsEvents: {
        method: 'get',
        uri: '/agendas/:uid/events.ics',
      },
    },
  },
};

if (process.env.DEBUG) {
  config.logger.enableDebug = Array.isArray(process.env.DEBUG) ? process.env.DEBUG.join(',') : process.env.DEBUG;
}

debug.disable();

debug.enable(config.logger.enableDebug);

config.getLogConfig = (prefix, key, keyInPrefix = true) => ({
  prefix: keyInPrefix ? `${prefix}:${key}:` : `${prefix}:`,
  token: process.env.NODE_ENV !== 'production' ? null : prod.insightOps[key],
});

module.exports = config;
