'use strict';

const fs = require('fs');
const schemaNames = require('./mock/schemaNames');
const getLogConfig = require('./mock/getLogConfig');

const testConfig = {
  track: true,
  queues: {},
  db: {
    host: process.env.OA_MYSQL_TEST_HOST,
    user: process.env.OA_MYSQL_TEST_USER,
    password: process.env.OA_MYSQL_TEST_PASSWORD,
    database: 'oatest',
    ssl: true
  },
  redis: {
    host: 'localhost',
    port: 6379
  },
  schemas: schemaNames,
  tmpFolderPath: '/var/tmp/',
  imageSizeLimits: [2000, 30000000],
  aws: {
    bucket: process.env.AWS_TEST_BUCKET,
    accessKeyId: process.env.AWS_DEV_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_DEV_SECRET_ACCESS_KEY,
    defaultImagePath: process.env.OA_DEFAULT_IMAGE_PATH,
    imageBucketPath: 'https://openagendatest.s3.amazonaws.com/'
  },
  getLogConfig,
  logger: {
    debug: {
      prefix: 'oa:',
      enable: false
    }
  },
  opencage: {
    key: process.env.OPENCAGE_KEY
  },
  es: {
    host: process.env.OA_ELASTICSEARCH_134_DEV_HOST,
    port: process.env.OA_ELASTICSEARCH_134_DEV_PORT,
    ssl: process.env.OA_ELASTICSEARCH_134_DEV_USE_SSL ? {
      key: fs.readFileSync(process.env.OA_CLIENT_SSL_KEY, 'utf-8'),
      cert: fs.readFileSync(process.env.OA_CLIENT_SSL_CERT, 'utf-8'),
      rejectUnauthorized: !process.env.OA_ELASTICSEARCH_134_DEV_SSL_NO_VERIFY
    } : null
  },
  es75: {
    host: process.env.OA_ELASTICSEARCH_750_DEV_HOST,
    port: process.env.OA_ELASTICSEARCH_750_DEV_PORT,
    defaultIndex: 'test',
    ssl: process.env.OA_ELASTICSEARCH_750_DEV_USE_SSL ? {
      key: fs.readFileSync(process.env.OA_CLIENT_SSL_KEY, 'utf-8'),
      cert: fs.readFileSync(process.env.OA_CLIENT_SSL_CERT, 'utf-8'),
      rejectUnauthorized: !process.env.OA_ELASTICSEARCH_750_DEV_SSL_NO_VERIFY
    } : null
  },
  agendaSearchAlias: process.env.OA_AGENDA_SEARCH_TEST_ALIAS || 'agendas_test',
  oembed: {
    key: process.env.IFRAMELY_KEY
  },
  enableMigrations: false
};

module.exports = {
  ...testConfig,
  extendWith: (config = {}) => ({
    ...testConfig,
    ...config
  })
};
