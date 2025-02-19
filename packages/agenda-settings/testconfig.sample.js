import Files from '@openagenda/files';

export default {
  services: {
    agendas: false,
  },
  mysql: {
    host: '127.0.0.1',
    database: 'oa_test_agendasettings',
    password: 'grut',
    user: 'root',
  },
  schemas: {
    agenda: 'agenda',
    agendaEvent: 'agenda_event',
    key: 'key',
  },
  Files: Files({
    s3: {
      endpoint: process.env.S3_DEV_ENDPOINT,
      accessKeyId: process.env.S3_DEV_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_DEV_SECRET_ACCESS_KEY,
      region: process.env.S3_DEV_REGION,
      defaultBucket: process.env.S3_DEV_BUCKET,
    },
    defaultProvider: 's3',
  }),
  imagePath: '//cdn.openagenda.com/dev/',
  debug: true,
  redis: {
    connection: {
      host: 'localhost',
      port: 6379,
    },
  },
};
