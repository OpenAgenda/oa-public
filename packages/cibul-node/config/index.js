import fs from 'node:fs';
import debug from 'debug';
import * as Sentry from '@sentry/node';
import prod from './prod.js';

const mailgun = {
  auth: {
    domain: process.env.MAILGUN_DOMAIN,
    apiKey: process.env.MAILGUN_KEY,
  },
};

const insightOpsKeys = (process.env.OA_INSIGHT_OPS ?? '').length
  ? process.env.OA_INSIGHT_OPS.split('|').reduce((ops, pair) => {
    const [key, value] = pair.split(':');
    ops[key] = value;
    return ops;
  }, {})
  : prod.insightOps ?? {};

const config = {
  env: process.env.NODE_ENV ?? 'development',
  corpoLastUpdate: '2017-10-31T12:07:29.000Z',
  superAdminUids: (process.env.OA_SUPERADMIN_UIDS ?? '')
    .split(',')
    .map((uid) => parseInt(uid, 10)),
  jsVersion: 42,
  cssVersion: 2,
  interfaceLanguages: ['fr', 'en', 'de', 'es', 'it', 'br', 'oc'],
  nextPort: process.env.OA_NEXT_PORT || 8901,
  port: process.env.OA_SERVER_PORT || 8903,
  apiPort: process.env.OA_API_PORT || 8902,
  jobsQueue: 'jobs',
  enableMigrations: true,
  queues: {
    aggregator: 'aggregator',
    oembed: 'oembed',
    stakeholderCreate: 'stakeholderCreate',
    notificationAddActivity: 'notificationAddActivity',
    notificationSendSummary: 'notificationSendSummary',
    inboxesSync: 'inboxesSync',
  },
  agendaSearchRecentThreshold: parseInt(
    process.env.AGENDA_SEARCH_RECENT_THRESHOLD_DAYS || 14,
    10,
  ),
  tmpFolderPath: '/var/tmp/',
  logPath: '/var/tmp/cibul-node.log',
  logPathDebug: '/var/tmp/cibul-node-debug.log',
  logPathError: '/var/tmp/cibul-node-errors.log',
  logger:
    process.env.NODE_ENV === 'production'
      ? {
        prefix: 'oa:',
        enableDebug: false,
        token: insightOpsKeys?.oa ?? null,
        sentry: Sentry,
      }
      : {
        prefix: 'oa:',
        token: false,
      },
  name: 'cibul-node',
  domain: prod.domains?.main ?? process.env.DOMAIN ?? 'd.openagenda.com',
  root: prod.root ?? process.env.ROOT ?? 'https://d.openagenda.com',
  apiRoot: prod.apiRoot ?? process.env.API_ROOT,
  apiDomain: prod.apiDomain ?? process.env.API_DOMAIN,
  logo: prod.logo,
  googleAnalyticsId:
    process.env.GOOGLE_ANALYTICS_ID
    || (prod.googleAnalytics && prod.googleAnalytics.id),
  embedGoogleAnalyticsId:
    process.env.GOOGLE_ANALYTICS_EMBED_ID
    || (prod.googleAnalytics && prod.googleAnalytics.embedId),
  matomoCloudId: prod.matomoCloudId ?? process.env.MATOMO_CLOUD_ID,
  useCache: false,
  agendaCacheExpire: 30 * 1000,
  shares: {
    agenda: ['twitter', 'facebook', 'googlePlus', 'linkedIn'],
  },
  adminEmail: 'admin@openagenda.com',
  callToActionEmails: prod.sales && prod.sales.emails,
  contactResource: prod.sales && prod.sales.pipedriveForm,
  tiles: prod.tiles || process.env.MAP_TILES,
  enforceAPISizeLimitAgendaExclusionList: [
    50522407, 17821345, 69218883, 98559275, 17341714, 23868942, 52853891,
    85121895, 58095305, 76126842, 63471975, 49283376, 44891982, 6013618,
    83549053, 71022838, 2749382, 82470621, 83770274, 78042370, 253926, 4641117,
    6922839, 3224921, 22851577, 979472, 9059178, 13880145, 68165804, 2342325,
    36779486, 87231512, 9847586, 78613663, 83392987, 91990573, 16440826,
    6956942, 72639287, 93202109, 96583097, 92305987, 33200551, 12003263,
    37233432, 78623851, 17542672, 96215598, 27549140, 69319016, 63637214,
    6956618, 87833415, 16265731, 68229714, 10905380, 86184123, 20289708,
    14758456, 1108324, 6922839, 42448083, 2883956, 69322949, 80515007, 14115607,
    96493090, 13844012, 13885588, 28622776, 32257586, 35336366, 36404645,
    44378712, 51677067, 55205678, 60871835, 72120377, 76028533, 83007326,
    89137171, 9434165, 97256762, 99371247, 41792566, 63578210, 10387409,
    26283955, 94991195, 61694203, 81741424, 36994113, 20500020,
  ],
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
    ssl: parseInt(process.env.MYSQL_SSL_VERIFY, 10)
      ? {
        ca: fs.readFileSync(process.env.MYSQL_SSL_CA),
        cert: fs.readFileSync(process.env.MYSQL_SSL_CERT),
        key: fs.readFileSync(process.env.MYSQL_SSL_KEY),
      }
      : undefined,
  },
  mails: {
    transport:
      process.env.NODE_ENV === 'production'
        ? {
          mailgun,
        }
        : {
          pool: !!parseInt(process.env.MAIL_POOL, 10),
          host: process.env.MAIL_HOST ?? '127.0.0.1',
          port: process.env.MAIL_PORT ?? '1025',
          secure: !!parseInt(process.env.MAIL_SECURE, 10),
          auth: process.env.MAIL_AUTH_USER
            ? {
              user: process.env.MAIL_AUTH_USER,
              pass: process.env.MAIL_AUTH_PASSWORD,
            }
            : undefined,
          maxMessages: Infinity,
          maxConnections: 5,
          rateLimit: 14,
          rateDelta: 1000,
        },
    disableVerify: !!parseInt(process.env.MAIL_DISABLE_VERIFY, 10),
    domain: 'mail.openagenda.com',
    defaults: {
      from: '"OpenAgenda" <no-reply@mail.openagenda.com>',
      replyTo: '"OpenAgenda" <admin@openagenda.com>',
    },
  },
  unsubscriptionsSecret: process.env.UNSUBSCRIPTIONS_SECRET,
  schemas: {
    activity: 'activity',
    agenda: 'review',
    aggregator: 'aggregator',
    aggregatorSource: 'aggregator_source',
    apiKeySet: 'api_key_set',
    eventService: 'event_2',
    agendaEventService: 'agenda_event',
    location: 'location',
    locationSet: 'location_set',
    stakeholder: 'reviewer',
    user: 'user',
    userToken: 'user_token',
    invitation: 'invitation_2', // new invitation
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
    emailUtilsMessageIds: 'inboxes_email_message_ids',
    emailUtilsReplyTos: 'inboxes_email_reply_tos',
    rule: 'rule',
  },
  mtCaptcha: {
    enabled: !!(process.env.OA_MT_CAPTCHA_ENABLED
      ? parseInt(process.env.OA_MT_CAPTCHA_ENABLED, 10)
      : prod.mtCaptcha),
    verifyUrl:
      process.env.OA_MT_CAPTCHA_VERIFY_URL ?? prod.mtCaptcha?.verifyUrl,
    siteKey: process.env.OA_MT_CAPTCHA_SITE_KEY ?? prod.mtCaptcha?.siteKey,
    privateKey:
      process.env.OA_MT_CAPTCHA_PRIVATE_KEY ?? prod.mtCaptcha?.privateKey,
  },
  auth: {
    facebook:
      prod.facebook?.appId ?? process.env.OA_FACEBOOK_ID
        ? {
          id: prod.facebook?.appId ?? process.env.OA_FACEBOOK_ID,
          secret: prod.facebook?.appSecret ?? process.env.OA_FACEBOOK_SECRET,
        }
        : null,
    google:
      prod.googleApps ?? process.env.OA_OAUTH_GOOGLE_ID
        ? {
          id: prod?.googleApps?.id ?? process.env.OA_OAUTH_GOOGLE_ID,
          secret:
              prod?.googleApps?.secret || process.env.OA_OAUTH_GOOGLE_SECRET,
        }
        : null,
  },
  discord: prod.discord ?? {
    token: process.env.OA_DISCORD_TOKEN,
    channel: process.env.OA_DISCORD_CHANNEL,
  },
  crisp: prod.crisp || process.env.CRISP_WEBSITE_ID,
  newsletter: {
    crispIdentifier: process.env.CRISP_IDENTIFIER,
    crispKey: process.env.CRISP_KEY,
  },
  es75: prod.elasticsearch?.v7_5 ?? {
    agendaEventsIndex:
      process.env.ES_AGENDA_EVENTS_INDEX
      ?? (process.env.NODE_ENV === 'production' ? 'main' : 'dev'),
    host: process.env.ES_HOST ?? 'localhost',
    port: process.env.ES_PORT ?? 9207,
    protocol: process.env.ES_PROTOCOL,
    ssl: parseInt(process.env.ES_USE_SSL, 10)
      ? {
        key: fs.readFileSync(process.env.CLIENT_SSL_KEY, 'utf-8'),
        cert: fs.readFileSync(process.env.CLIENT_SSL_CERT, 'utf-8'),
      }
      : null,
  },
  esEvents: {
    maxIndexableTimingCount: 3000,
  },
  agendaSearchAlias:
    process.env.OA_AGENDA_SEARCH_ALIAS || prod.agendaSearchAlias || 'agendas',
  redis: process.env.REDIS_CLUSTER_NODES
    ? {
      clusterMode: true,
      nodes: process.env.REDIS_CLUSTER_NODES.split(','),
      password: process.env.REDIS_PWD,
    }
    : {
      clusterMode: false,
      host: prod.redis?.host ?? process.env.REDIS_HOST ?? 'localhost',
      port: prod.redis?.port ?? process.env.REDIS_PORT ?? 6379,
    },
  locationDuplicationDetection: {
    enabled:
      prod.detectLocationDuplicates
      ?? !!process.env.OA_DETECT_LOCATION_DUPLICATES,
    ignoredUids: {
      setUids:
        prod.detectLocationDuplicatesIgnoredSetUids
        ?? (process.env.OA_DETECT_LOCATION_DUPLICATES_IGNORED_SET_UIDS ?? '')
          .split(',')
          .map((i) => parseInt(i, 10)),
      agendaUids:
        prod.detectLocationDuplicatesIgnoredAgendaUids
        ?? (process.env.OA_DETECT_LOCATION_DUPLICATES_IGNORED_AGENDA_UIDS ?? '')
          .split(',')
          .map((i) => parseInt(i, 10)),
    },
    sleep:
      prod.detectLocationDuplicatesSleep
      ?? (process.env.OA_DETECT_LOCATION_DUPLICATES_SLEEP
        ? parseInt(process.env.OA_DETECT_LOCATION_DUPLICATES_SLEEP, 10)
        : 0),
  },
  session: {
    name: 'oa', // session cookie name
    writableName: 'oa.rw', // store client-editable data
    userCookieName: 'oa.user',
    keys: prod.session
      ? prod.session.keys
      : process.env.OA_SESSION_KEYS.split(','),
    secret: prod.session ? prod.session.secret : process.env.OA_SESSION_SECRET,
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
    namespace: 'sessions',
    signed: true,
    secure: true,
    sameSite: 'Lax',
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
    'tipent.com',
    'tiuas.com',
    'touchend.com',
    'royalka.com',
    'yopmail.com',
    'floodouts.com',
    'stikezz.com',
    'padvn.com',
    'tiervo.com',
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
    imageBucketPath: prod.aws
      ? `https://${prod.aws.buckets.main}.s3.amazonaws.com/`
      : process.env.AWS_MAIN_PATH,
    bucket: prod.aws?.buckets?.main ?? process.env.AWS_MAIN_BUCKET,
    defaultImagePath:
      process.env.DEFAULT_IMAGE_PATH
      ?? '//cdn.openagenda.com/static/graylogo140.png',
    defaultImageSize: {
      width: parseInt(process.env.DEFAULT_IMAGE_SIZE_WIDTH ?? '140', 10),
      height: parseInt(process.env.DEFAULT_IMAGE_SIZE_HEIGHT ?? '140', 10),
    },
    oaLogoIcon: 'https://cdn.openagenda.com/static/logo_icon_300.jpg',
  },
  s3: {
    endpoint: process.env.S3_ENDPOINT,
    accessKeyId: process.env.S3_KEY,
    secretAccessKey: process.env.S3_SECRET,
    region: process.env.S3_REGION,
    bucket: process.env.S3_MAIN_BUCKET,
    assetsBucketPath: process.env.S3_ASSETS_PATH,
    mainBucketPath: process.env.S3_MAIN_PATH,
    docxBucketPath: process.env.S3_DOCX_PATH,
    defaultImagePath: 'https://cdn.openagenda.com/static/graylogo140.png',
    defaultImageSize: {
      width: 140,
      height: 140,
    },
    oaLogoIcon: 'https://cdn.openagenda.com/static/logo_icon_300.jpg',
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
  pdf: {
    withImageLimit: process.env.PDF_WITH_IMAGE_LIMIT ?? 200,
  },
  mailjet: {
    apiKey: process.env.MAILJET_KEY ?? prod.mailjet?.apiKey,
    apiSecret: process.env.MAILJET_SECRET ?? prod.mailjet?.apiSecret,
    contactsListId:
      process.env.MAILJET_CONTACTS_LIST_ID ?? prod.mailjet?.contactsListId,
  },
  passCulture: {
    key: process.env.PASS_CULTURE_KEY,
    api: process.env.PASS_CULTURE_API,
    offerLink: process.env.PASS_CULTURE_OFFER_LINK,
    offerEditLink: process.env.PASS_CULTURE_OFFER_EDIT_LINK,
    pending: {
      delay: parseInt(
        process.env.PASS_CULTURE_PENDING_INITIAL_DELAY ?? 1000 * 60 * 60 * 12,
        10,
      ), // 12h
      minDelay: parseInt(
        process.env.PASS_CULTURE_MIN_DELAY ?? 1000 * 60 * 60 * 3,
        10,
      ), // 3h
      maxRetries: process.env.PASS_CULTURE_PENDING_RETRIES ?? 20, // why not
    },
  },
  mailgun,
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
  twitter: {
    name: prod.twitter && prod.twitter.name,
  },
  maxFileSize: 20000000,
  imageSizeLimits: [2000, 30000000],
  translators: prod?.translators ?? [],
  routes: {
    globals: {
      agendaAdminShow: {
        method: 'get',
        uri: '/:slug/admin/events',
      },
      agendaEventNavigate: {
        method: 'get',
        uri: '/:slug/navigate',
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
      supportConversation: {
        method: 'get',
        uri: '/admin/support/conversation/:conversationId',
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
      agendaEventActionShow: {
        method: 'get',
        uri: '/:slug/events/:eventSlug/action',
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
      agendaLocationSet: {
        method: 'post',
        uri: '/:slug/locations',
      },
      locationResync: {
        method: 'get',
        uri: '/:slug/admin/locations/resync',
      },
      locationToVerifyCount: {
        method: 'get',
        uri: '/:slug/admin/locations/verifycount',
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
    },
  },
};

if (process.env.DEBUG) {
  config.logger.enableDebug = Array.isArray(process.env.DEBUG)
    ? process.env.DEBUG.join(',')
    : process.env.DEBUG;
}

debug.disable();

debug.enable(config.logger.enableDebug);

config.getLogConfig = (prefix, key, keyInPrefix = true) => ({
  prefix: keyInPrefix ? `${prefix}:${key}:` : `${prefix}:`,
  token: insightOpsKeys[key],
});

export default config;
