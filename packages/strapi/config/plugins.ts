export default ({ env }) => ({
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        baseUrl: env('S3_ASSETS_PATH').replace(/\/$/, ''),
        rootPath: env('S3_ROOT_PATH'),
        s3Options: {
          forcePathStyle: true,
          credentials: {
            accessKeyId: env('S3_KEY'),
            secretAccessKey: env('S3_SECRET'),
          },
          endpoint: env('S3_ENDPOINT'),
          region: env('S3_REGION'),
          params: {
            ACL: env('S3_ACL', 'public-read'),
            signedUrlExpires: env('AWS_SIGNED_URL_EXPIRES', 15 * 60),
            Bucket: env('S3_ASSETS_BUCKET'),
          },
        },
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
});
