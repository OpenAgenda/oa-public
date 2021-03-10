'use strict';

const AWS = require('aws-sdk');

module.exports = function createS3Provider(cfg) {
  const { accessKeyId, secretAccessKey, defaultBucket } = cfg;

  const s3 = new AWS.S3({
    accessKeyId,
    secretAccessKey,
    apiVersion: '2006-03-01',
  });

  return {
    // Should return { promise() {}, abort() {} }
    upload(stream, filename, params = {}) {
      const s3Params = {
        Key: filename,
        Body: stream,
        ACL: 'public-read',
        ...params,
        Bucket: params.bucket || defaultBucket,
      };

      // Return a ManagedUpload (https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3/ManagedUpload.html)
      return s3.upload(s3Params);
    },
    remove(filename, params = {}) {
      const keys = Array.isArray(filename) ? filename : [filename];

      const s3Params = {
        Delete: {
          Objects: keys.map(Key => ({ Key })),
        },
        ...params,
        Bucket: params.bucket || defaultBucket,
      };

      return s3.deleteObjects(s3Params).promise();
    },
    exists(filename, params = {}) {
      const s3Params = {
        Key: filename,
        ...params,
        Bucket: params.bucket || defaultBucket,
      };

      return s3
        .headObject(s3Params)
        .promise()
        .then(
          () => true,
          err => {
            if (err.name === 'NotFound') {
              return false;
            }

            throw err;
          }
        );
    },
  };
};
