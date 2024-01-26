'use strict';

const os = require('node:os');

module.exports = {
  s3: {
    region: process.env.AWS_DEV_REGION,
    accessKeyId: process.env.AWS_DEV_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_DEV_SECRET_ACCESS_KEY,
    bucket: process.env.AWS_DEV_BUCKET,
  },
  redis: {
    port: 6379,
    host: 'localhost',
  },
  localTmpPath: os.tmpdir(),
};
