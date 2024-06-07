import files from '@openagenda/files';

export function init({ aws }) {
  return files({
    s3: {
      accessKeyId: aws.accessKeyId,
      secretAccessKey: aws.secretAccessKey,
      defaultBucket: aws.bucket,
      // TODO logger: config.getLogConfig('svc', 'files', false)
    },
    defaultProvider: 's3',
  });
}
