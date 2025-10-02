export default {
  mysql: {
    database: 'oatest_aes',
    user: 'root',
    password: 'grut',
    jsonStrings: true,
    ssl: { rejectUnauthorized: false },
  },
  schemas: {
    network: 'network',
    formSchema: 'form_schema',
  },
  imagePath: 'https://cdn.openagenda.com/dev/',
  s3: {
    endpoint: process.env.S3_DEV_ENDPOINT,
    accessKeyId: process.env.S3_DEV_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_DEV_SECRET_ACCESS_KEY,
    region: process.env.S3_DEV_REGION,
    defaultBucket: process.env.S3_DEV_BUCKET,
  },
};
