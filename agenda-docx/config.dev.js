'use strict';

const os = require('os');

module.exports = {
  s3: {
    region: 'eu-west-1',
    accessKeyId: process.env.AWS_DEV_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_DEV_SECRET_ACCESS_KEY,
    bucket: process.env.AWS_TEST_BUCKET,
  },
  queue: {
    namespace: 'docx',
    separator: ':',
    redis: {
      port: 6379,
      host: 'localhost'
    }
  },
  localTmpPath: os.tmpdir()
};
