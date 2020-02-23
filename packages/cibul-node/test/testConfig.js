'use strict';

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
  tmpFolderPath: '/var/tmp',
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
  es: {
    host: process.env.ELASTICSEARCH_134_DEV_HOST,
    port: process.env.ELASTICSEARCH_134_DEV_PORT
  },
  es53: {
    host: process.env.ELASTICSEARCH_533_DEV_HOST,
    port: process.env.ELASTICSEARCH_533_DEV_PORT
  },
  es75: {
    host: process.env.OA_ELASTICSEARCH_750_DEV_HOST,
    defaultIndex: 'test'
  }
}
