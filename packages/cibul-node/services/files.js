'use strict';

const files = require('@openagenda/files');

module.exports.init = config => files({
  s3: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
    defaultBucket: config.aws.bucket,
    // TODO logger: config.getLogConfig('svc', 'files', false)
  },
  defaultProvider: 's3',
});
