'use strict';

const fs = require('fs');
const config = require('../config');
const schemaNames = require('./mock/schemaNames');
const getLogConfig = require('./mock/getLogConfig');

module.exports = {
  track: true,
  queues: {},
  db: {
    user: 'root',
    password: 'grut',
    database: 'oatest'
  },
  redis: {
    host: 'localhost',
    port: 6379
  },
  schemas: schemaNames,
  tmpFolderPath: '/var/tmp/',
  imageSizeLimits: [2000, 30000000],
  aws: {
    bucket: 'openagendatest',
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
    defaultImagePath: config.aws.defaultImagePath,
    imageBucketPath: 'https://openagendatest.s3.amazonaws.com/'
  },
  mainChannel: 'maintest',
  getLogConfig,
  logger: {
    debug: {
      prefix: 'oa:',
      enable: false
    }
  },
  esLocation: {
    //log: [  ],
    index: 'locations',
    apiVersion: '1.3',
    timeout: 30000
  },
  opencage: {
    key: process.env.OPENCAGE_KEY
  },
  es: {
    host: process.env.OA_ELASTICSEARCH_134_DEV_HOST,
    port: process.env.OA_ELASTICSEARCH_134_DEV_PORT,
    ssl: process.env.OA_ELASTICSEARCH_134_DEV_USE_SSL ? {
      key: fs.readFileSync(process.env.OA_CLIENT_SSL_KEY, 'utf-8'),
      cert: fs.readFileSync(process.env.OA_CLIENT_SSL_CERT, 'utf-8')
    } : null
  },
  es75: {
    host: process.env.OA_ELASTICSEARCH_750_DEV_HOST,
    port: process.env.OA_ELASTICSEARCH_750_DEV_PORT,
    defaultIndex: 'test',
    ssl: process.env.OA_ELASTICSEARCH_750_DEV_USE_SSL ? {
      key: fs.readFileSync(process.env.OA_CLIENT_SSL_KEY, 'utf-8'),
      cert: fs.readFileSync(process.env.OA_CLIENT_SSL_CERT, 'utf-8')
    } : null
  }
}
