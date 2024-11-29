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
      occurrence: 'occurrence',
      agendaEvent: 'agenda_event',
    },

    imagePath: '//openagendatest.s3.amazonaws.com/',

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
        accessKeyId: process.env.AWS_DEV_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_DEV_SECRET_ACCESS_KEY,
        region: process.env.AWS_DEV_REGION,
        defaultBucket: process.env.AWS_DEV_BUCKET,
      },
      defaultProvider: 's3',
    },
  },
};
