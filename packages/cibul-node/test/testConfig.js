import fs from 'node:fs';
import appConfig from '../config/index.js';

const testConfig = {
  domain: 'openagenda.com',
  track: true,
  knexService: {
    slowLogThreshold: parseInt(
      process.env.MYSQL_SLOW_LOG_THRESHOLD ?? '1000',
      10,
    ),
    pool: {
      min: parseInt(process.env.MYSQL_POOL_MIN ?? '2', 10),
      max: parseInt(process.env.MYSQL_POOL_MAX ?? '10', 10),
    },
  },
  db: {
    host: process.env.OA_MYSQL_TEST_HOST,
    user: process.env.OA_MYSQL_TEST_USER,
    password: process.env.OA_MYSQL_TEST_PASSWORD,
    database: 'oatest',
    charset: 'utf8mb4',
    jsonStrings: true,
    ssl: {
      rejectUnauthorized: false,
    },
    decimalNumbers: true,
  },
  redis: {
    host: 'localhost',
    port: 6379,
  },
  schemas: appConfig.schemas,
  tmpFolderPath: '/var/tmp/',
  s3: {
    endpoint: process.env.S3_DEV_ENDPOINT,
    accessKeyId: process.env.S3_DEV_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_DEV_SECRET_ACCESS_KEY,
    region: process.env.S3_DEV_REGION,
    bucket: process.env.S3_TEST_BUCKET,
    mainBucketPath: process.env.S3_TEST_MAIN_PATH,
    defaultImagePath: process.env.OA_DEFAULT_IMAGE_PATH,
  },
  logger: {
    prefix: 'oa:',
    token: false,
  },
  getLogConfig: (prefix, key, keyInPrefix = true) => ({
    prefix: keyInPrefix ? `${prefix}:${key}:` : `${prefix}:`,
  }),
  opencage: {
    key: process.env.OPENCAGE_KEY,
  },
  es75: {
    agendaEventsIndex: 'test',
    host: process.env.OA_ELASTICSEARCH_750_DEV_HOST,
    port: process.env.OA_ELASTICSEARCH_750_DEV_PORT,
    ssl: process.env.OA_ELASTICSEARCH_750_DEV_USE_SSL
      ? {
        key: fs.readFileSync(process.env.OA_CLIENT_SSL_KEY, 'utf-8'),
        cert: fs.readFileSync(process.env.OA_CLIENT_SSL_CERT, 'utf-8'),
        rejectUnauthorized:
            !process.env.OA_ELASTICSEARCH_750_DEV_SSL_NO_VERIFY,
      }
      : null,
    refreshTransverseIndex: {
      onUpdate: true,
      onRemove: true,
    },
  },
  agendaSearchAlias: process.env.OA_AGENDA_SEARCH_TEST_ALIAS || 'agendas_test',
  oembed: {
    key: process.env.IFRAMELY_KEY,
  },
  mails: {
    transport: {
      host: '127.0.0.1',
      port: '1025',
      secure: false,
      maxMessages: Infinity,
      maxConnections: 5,
      rateLimit: 14,
      rateDelta: 1000,
    },
    disableVerify: false,
    defaults: {
      from: '"OpenAgenda" <no-reply@test.openagenda.com>',
      replyTo: '"OpenAgenda" <test@openagenda.com>',
    },
  },
  disableMigrationsCheck: true,
  passCulture: {
    key: process.env.PASS_CULTURE_KEY,
    api: process.env.PASS_CULTURE_API,
    offerLink: process.env.PASS_CULTURE_OFFER_LINK,
    pending: {
      delay: 0,
      minDelay: 0,
      maxRetries: 3,
    },
  },
  unsubscriptionsSecret: 'supersecretstring',
  superAdminUids: [838438477721],
};

if (process.env.DEBUG) {
  testConfig.logger.enableDebug = Array.isArray(process.env.DEBUG)
    ? process.env.DEBUG.join(',')
    : process.env.DEBUG;
}

export default {
  ...testConfig,
  extendWith: (config = {}) => ({
    ...testConfig,
    ...config,
  }),
};
