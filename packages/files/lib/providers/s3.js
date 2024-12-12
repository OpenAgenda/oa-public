'use strict';

const {
  S3Client,
  DeleteObjectsCommand,
  HeadObjectCommand,
} = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');

// function formatLocation(projectId, location) {
//   if (!projectId) {
//     return location;
//   }
//
//   try {
//     const url = new URL(location);
//     const newHost = `${projectId}.${url.hostname}`;
//     url.hostname = newHost;
//
//     return url.toString();
//   } catch (_error) {
//     return location;
//   }
// }

module.exports = function createS3Provider(cfg) {
  const {
    endpoint,
    region,
    // projectId,
    accessKeyId,
    secretAccessKey,
    defaultBucket,
  } = cfg;

  const s3 = new S3Client({
    endpoint,
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: true,
    // logger: console,
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

      const upload = new Upload({
        client: s3,
        params: s3Params,
      });

      return {
        async promise() {
          const result = await upload.done();
          return {
            ...result,
            // Location: formatLocation(projectId, result.Location),
            // `key` = `Key` for backward compatibility
            key: result.Key,
          };
        },
        abort() {
          return upload.abort();
        },
      };
    },
    async remove(filename, params = {}) {
      const keys = Array.isArray(filename) ? filename : [filename];

      const s3Params = {
        Delete: {
          Objects: keys.map((Key) => ({ Key })),
        },
        ...params,
        Bucket: params.bucket || defaultBucket,
      };

      return s3.send(new DeleteObjectsCommand(s3Params));
    },
    async exists(filename, params = {}) {
      const s3Params = {
        Key: filename,
        ...params,
        Bucket: params.bucket || defaultBucket,
      };

      try {
        await s3.send(new HeadObjectCommand(s3Params));
        return true;
      } catch (err) {
        if (err.name === 'NotFound') {
          return false;
        }
      }
    },
  };
};
