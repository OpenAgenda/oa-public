'use strict';

module.exports = {
  bucket: 'cibultest',
  tmpBucketPath: 'https://cibultmp.s3.amazonaws.com/',
  tmpBucket: 'cibultmp',
  accessKeyId: 'AKIAJCTNQBIZSAPX7HUQ',
  secretAccessKey: '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',

  // v3
  s3: {
    accessKeyId: 'AKIAJCTNQBIZSAPX7HUQ',
    secretAccessKey: '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',
    region: 'eu-west-1', // optional
    defaultBucket: 'oadev'
  },

  defaultProvider: 's3'
};
