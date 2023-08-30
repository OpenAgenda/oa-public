'use strict';

module.exports = {
  bucket: 'cibultest',
  tmpBucketPath: 'https://cibultmp.s3.amazonaws.com/',
  tmpBucket: 'cibultmp',
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SECRET,

  // v3
  s3: {
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET,
    region: 'eu-west-1', // optional
    defaultBucket: 'oadev',
  },

  defaultProvider: 's3',
};
