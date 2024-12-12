import os from 'node:os';

export default {
  s3: {
    endpoint: process.env.S3_DEV_ENDPOINT,
    projectId: process.env.S3_DEV_PROJECT_ID,
    accessKeyId: process.env.S3_DEV_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_DEV_SECRET_ACCESS_KEY,
    region: process.env.S3_DEV_REGION,
    bucket: process.env.S3_DEV_BUCKET,
  },
  redis: {
    port: 6379,
    host: 'localhost',
  },
  localTmpPath: os.tmpdir(),
};
