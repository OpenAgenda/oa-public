'use strict';

const fs = require('node:fs');

module.exports = {
  service: {
    mysql: {
      host: process.env.OA_MYSQL_DEV_HOST,
      user: process.env.OA_MYSQL_DEV_USER,
      password: process.env.OA_MYSQL_DEV_PASSWORD,
      database: 'location_test',
      ssl: parseInt(process.env.OA_MYSQL_DEV_SSL_VERIFY, 10)
        ? {
          ca: fs.readFileSync(process.env.OA_MYSQL_DEV_SSL_CA),
          cert: fs.readFileSync(process.env.OA_MYSQL_DEV_SSL_CERT),
          key: fs.readFileSync(process.env.OA_MYSQL_DEV_SSL_KEY),
        }
        : { rejectUnauthorized: false },
      jsonStrings: true,
      decimalNumbers: true,
    },
    schemas: {
      location: 'location',
      agendaSettings: 'location_agenda_settings',
    },
    redis: {
      host: 'localhost',
      port: 6379,
    },
    interfaces: {
      getEventCount: (l, cb) => {
        cb(null, 0, 0);
      },
      getAgendaSettings: (agendaId, cb) => {
        cb(null, {});
      },
    },
  },
  dependencies: {
    files: {
      s3: {
        endpoint: process.env.S3_DEV_ENDPOINT,
        accessKeyId: process.env.S3_DEV_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_DEV_SECRET_ACCESS_KEY,
        region: process.env.S3_DEV_REGION,
        defaultBucket: process.env.S3_DEV_BUCKET,
      },
      defaultProvider: 's3',
    },
  },
};
