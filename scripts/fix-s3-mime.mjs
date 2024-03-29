// This script fixes mime types on all files in a bucket.
// It may take a long time to execute and should not be launched without reason.

import AWS from 'aws-sdk';
import fileType from 'file-type';

const {
  AWS_ACCESS_KEY_ID: accessKeyId,
  AWS_SECRET_ACCESS_KEY: secretAccessKey,
  AWS_BUCKET: awsBucket,
  START_AFTER: startAfter,
} = process.env;

const s3 = new AWS.S3({ accessKeyId, secretAccessKey });

async function updateMimeType(bucket, key) {
  const file = await s3.getObject({ Bucket: bucket, Key: key }).promise();

  const mime = await fileType.fromBuffer(file.Body);

  if (mime && mime.mime) {
    await s3.copyObject({
      ACL: 'public-read',
      Bucket: bucket,
      CopySource: encodeURIComponent(`${awsBucket}/${key}`).replace(/%2F/g, '/'),
      Key: key,
      ContentType: mime.mime,
      MetadataDirective: 'REPLACE'
    }).promise();
    console.log(`MIME type updated for ${key}: ${mime.mime}\n  https://${awsBucket}.s3.eu-west-1.amazonaws.com/${encodeURIComponent(key)}`);
  }
}

async function processObject(bucket, object) {
  const head = await s3.headObject({ Bucket: bucket, Key: object.Key }).promise();
  if (head.ContentType === 'application/octet-stream') {
    await updateMimeType(bucket, object.Key);
  } else {
    console.log(`No need to update ${object.Key}`);
  }
}

async function processInBatches(bucket, objects, concurrentTasks) {
  let index = 0;
  const tasks = new Set();

  const enqueue = () => {
    if (index < objects.length) {
      const object = objects[index++];
      const task = processObject(bucket, object).finally(() => {
        tasks.delete(task);
        enqueue();
      });
      tasks.add(task);
      if (tasks.size < concurrentTasks) {
        enqueue();
      }
    }
  };

  enqueue();
  await Promise.all(tasks);
}

async function listAndUpdate(bucket) {
  let continuationToken = null;
  do {
    const listParams = {
      Bucket: bucket,
      ContinuationToken: continuationToken,
      StartAfter: startAfter,
    };

    const listedObjects = await s3.listObjectsV2(listParams).promise();
    await processInBatches(bucket, listedObjects.Contents, 20);

    continuationToken = listedObjects.NextContinuationToken;
  } while (continuationToken);
}

listAndUpdate(awsBucket).then(() => console.log('Finish'));
