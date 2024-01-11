'use strict';

const os = require('node:os');

module.exports = {
  s3: {
    region: 'eu-west-1',
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET,
    bucket: process.env.AWS_BUCKET,
  },
  queue: {
    namespace: 'docx',
    separator: ':',
    redis: {
      port: 6379,
      host: 'localhost',
    },
  },
  localTmpPath: os.tmpdir(),
};
