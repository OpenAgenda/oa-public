'use strict';

const AWS = require( 'aws-sdk' );

module.exports = function createS3Provider(cfg) {
  const {
    accessKeyId,
    secretAccessKey,
    defaultBucket
  } = cfg;

  const s3 = new AWS.S3({
    accessKeyId,
    secretAccessKey,
    // apiVersion: '2006-03-01'
  });

  return {
    upload(stream, filename, params = {}) {
      const s3Params = {
        Key: filename,
        Body: stream,
        ACL: 'public-read',
        ...params,
        Bucket: params.bucket || defaultBucket
      };

      return s3.upload(s3Params).promise();
    },
    remove(filename, params = {}) {
      const s3Params = {
        Key: filename,
        ...params,
        Bucket: params.bucket || defaultBucket
      };

      return s3.deleteObject(s3Params).promise();
    }
    // move
  };
};
