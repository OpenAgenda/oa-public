import fs from 'node:fs';

export const service = {
  mysql: {
    timeout: 120000,
    host: process.env.OA_MYSQL_DEV_HOST,
    user: process.env.OA_MYSQL_DEV_USER,
    password: process.env.OA_MYSQL_DEV_PASSWORD,
    database: 'event_test',
    charset: 'utf8mb4',
    jsonStrings: true,
    ssl: parseInt(process.env.OA_MYSQL_DEV_SSL_VERIFY, 10)
      ? {
        ca: fs.readFileSync(process.env.OA_MYSQL_DEV_SSL_CA),
        cert: fs.readFileSync(process.env.OA_MYSQL_DEV_SSL_CERT),
        key: fs.readFileSync(process.env.OA_MYSQL_DEV_SSL_KEY),
      }
      : { rejectUnauthorized: false },
  },
  schema: 'event_2',
  imagePath: 'https://cdn.openagenda.com/dev/',
  interfaces: {},
};

export const dependencies = {
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
};
