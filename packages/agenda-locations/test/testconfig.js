'use strict';

module.exports = {
  service: {
    mysql: {
      host: '127.0.0.1',
      user: 'root',
      password: 'grut',
      database: 'location_test',
      jsonStrings: true,
      decimalNumbers: true,
      ssl: { rejectUnauthorized: false },
    },
    schemas: {
      location: 'location',
      locationSet: 'location_set',
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
