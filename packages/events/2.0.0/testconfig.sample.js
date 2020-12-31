'use strict';

const fs = require('fs');

module.exports = {
  service: {
    mysql: {
      timeout: 120000,
      host: process.env.OA_MYSQL_DEV_HOST,
      user: process.env.OA_MYSQL_DEV_USER,
      password: process.env.OA_MYSQL_DEV_PASSWORD,
      database: 'event_test',
      ssl: parseInt(process.env.OA_MYSQL_DEV_SSL_VERIFY, 10)
        ? {
          ca: fs.readFileSync(process.env.OA_MYSQL_DEV_SSL_CA),
          cert: fs.readFileSync(process.env.OA_MYSQL_DEV_SSL_CERT),
          key: fs.readFileSync(process.env.OA_MYSQL_DEV_SSL_KEY)
        }
        : true
    },
    schema: 'event_2',
    imagePath: '//oadev.s3.eu-west-1.amazonaws.com/',
    interfaces: {
    }
  },
  dependencies: {
    files: {
      s3: {
        accessKeyId: process.env.AWS_DEV_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_DEV_SECRET_ACCESS_KEY,
        region: process.env.AWS_DEV_REGION,
        defaultBucket: process.env.AWS_DEV_BUCKET
      },
      defaultProvider: 's3'
    }
  }
}
