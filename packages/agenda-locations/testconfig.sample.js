'use strict';

const fs = require('node:fs');

module.exports = {
  service: {
    mysql: {
      host: process.env.OA_MYSQL_DEV_HOST,
      user: process.env.OA_MYSQL_DEV_USER,
      password: process.env.OA_MYSQL_DEV_PASSWORD,
      database: 'location_test',
      table: 'location',
      ssl: parseInt(process.env.OA_MYSQL_DEV_SSL_VERIFY, 10)
        ? {
          ca: fs.readFileSync(process.env.OA_MYSQL_DEV_SSL_CA),
          cert: fs.readFileSync(process.env.OA_MYSQL_DEV_SSL_CERT),
          key: fs.readFileSync(process.env.OA_MYSQL_DEV_SSL_KEY),
        }
        : true,
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
        accessKeyId: process.env.AWS_KEY,
        secretAccessKey: process.env.AWS_SECRET,
        region: process.env.AWS_REGION,
        defaultBucket: process.env.AWS_BUCKET,
      },
      defaultProvider: 's3',
    },
  },
};
