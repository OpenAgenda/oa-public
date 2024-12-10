import files from '@openagenda/files';

export function init({ s3 }) {
  return files({
    s3: {
      endpoint: s3.endpoint,
      region: s3.region,
      accessKeyId: s3.accessKeyId,
      secretAccessKey: s3.secretAccessKey,
      defaultBucket: s3.bucket,
      // TODO logger: config.getLogConfig('svc', 'files', false)
    },
    defaultProvider: 's3',
  });
}
