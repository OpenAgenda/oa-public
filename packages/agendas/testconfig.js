'use strict';

module.exports = {
  service: {
    mysql: {
      host: '127.0.0.1',
      database: 'agenda_test',
      password: 'grut',
      user: 'root',
      ssl: true,
    },

    schemas: {
      agenda: 'agenda',
      agendaEvent: 'agenda_event',
      stakeholder: 'stakeholder',
    },

    imagePath: 'https://cdn.openagenda.com/dev/',

    interfaces: {
      onCreate: (_agenda) => {},
      onUpdate: (_before, _after) => {},
      beforeRemove: (agenda, cb) => {
        cb();
      },
      onRemove: (_agenda) => {},
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
