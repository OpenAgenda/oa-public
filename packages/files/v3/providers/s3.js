'use strict';

const { promisify } = require('util');
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

  const s3Upload = promisify(s3.upload).bind(s3);

  return {
    upload(stream, filename, params) {
      const s3Params = {
        Key: filename,
        Body: stream,
        ACL: 'public-read',
        ...params,
        Bucket: params.bucket || defaultBucket
      };

      return s3Upload(s3Params);

      // return new Promise((resolve, reject) => {
      //   stream.on('error', error => {
      //     console.log('ERROR', error);
      //     stream.destroy();
      //     reject(error);
      //   })
      //
      //   s3Upload(s3Params).then(resolve, reject);
      // });
    }
    // move
  };
};
