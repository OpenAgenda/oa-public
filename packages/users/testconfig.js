export default {
  service: {
    paginate: {
      default: 20,
      max: 100,
    },
    mysql: {
      host: '127.0.0.1',
      database: 'oa_test_users',
      password: 'grut',
      user: 'root',
      ssl: { rejectUnauthorized: false },
    },
    schemas: {
      user: 'user',
      unsubscribed: 'unsubscribed',
      userToken: 'user_token',
    },
    imagePath: 'https://cdn.openagenda.com/dev/',
    interfaces: {
      getAgenda: (agendaUid, cb) =>
        cb(
          null,
          agendaUid === 85870128
            ? {
              slug: 'journees-arts-culture-sup-2017',
              title:
                  "2017 : Journées des Arts et de la Culture dans l'Enseignement Supérieur",
            }
            : {
              slug: 'semaineindustrie2017',
              title: "Semaine de l'Industrie 2017",
            },
        ),
      onActivation() {
        return async (context) => context;
      },
    },
    redis: {
      connection: {
        host: 'localhost',
        port: 6379,
      },
    },
    cache: {
      duration: 60,
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
