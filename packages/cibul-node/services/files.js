"use strict";

const files = require('@openagenda/files');
const filesV3 = require('@openagenda/files/v3');

module.exports.init = config => {
  files.init({
    bucket: config.aws.bucket,
    accessKeyId: config.aws.accessKeyId, // required
    secretAccessKey: config.aws.secretAccessKey, // required too
    logger: config.getLogConfig('svc', 'files', false)
  });

  return filesV3({
    s3: {
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
      defaultBucket: config.aws.bucket
    },

    defaultProvider: 's3'
  });
}
