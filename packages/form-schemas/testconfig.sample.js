export default {
  mysql: {
    database: 'oatest_aes',
    user: 'root',
    password: 'grut',
    ssl: true,
  },
  schemas: {
    network: 'network',
    formSchema: 'form_schema',
  },
  imagePath:
    'https://02034510ef5d488190e4cf17d19a788b.s3.pub1.infomaniak.cloud/dev/',
  s3: {
    endpoint: process.env.S3_DEV_ENDPOINT,
    accessKeyId: process.env.S3_DEV_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_DEV_SECRET_ACCESS_KEY,
    region: process.env.S3_DEV_REGION,
    defaultBucket: process.env.S3_DEV_BUCKET,
  },
};
