'use strict';

const gm = require('gm').subClass({
  imageMagick: true
});

const fs = require('fs');
const S3 = require('aws-sdk').S3;
const path = require('path');
const multer = require('multer');

const { promisify } = require('util');

module.exports = (config = {}) => {
  const {
    aws,
    temporaryDirectory,
    transforms
  } = {
    aws: {
      key: null,
      secret: null,
      bucket: null,
      ContentType: 'image/jpeg'
    },
    temporaryDirectory: '/tmp',
    transforms: [],
    ...config
  };

  const s3Client = new S3({
    accessKeyId: aws.key,
    secretAccessKey: aws.secret,
    apiVersion: '2006-03-01'
  });

  return {
    transform: path => Promise.all(transforms.map(t => transform({ temporaryDirectory }, t, path))),
    removeUploaded: removeUploaded.bind(null, { client: s3Client, bucket: aws.bucket }),
    renameUploaded: renameUploaded.bind(null, { client: s3Client, bucket: aws.bucket, ContentType: aws.ContentType }),
    upload: upload.bind(null,{ client: s3Client, bucket: aws.bucket, ContentType: aws.ContentType }),
    multer: multer({ dest: temporaryDirectory }).single('image')
  }
}

async function renameUploaded({ client, bucket, ContentType }, filename, newFilename) {
  await client.copyObject({
    Bucket: bucket,
    CopySource: `${bucket}/${filename}`,
    Key: newFilename,
    ACL: 'public-read',
    ContentType
  }).promise();

  await client.deleteObject({
    Bucket: bucket,
    Key: filename
  }).promise();

  return `https://${bucket}.s3.amazonaws.com/${newFilename}`;
}

async function removeUploaded({ client, bucket }, filename) {
  await client.deleteObject({
    Bucket: bucket,
    Key: filename
  }).promise();

  try {
    await client.getObjectAcl({
      Bucket: bucket,
      Key: filename
    }).promise();
  } catch (e) {
    if (e.code === 'NoSuchKey') return;
  }

  throw new Error('Image remove failed');
}

async function upload({ client, bucket, ContentType }, file) {
  return client.upload({
    Bucket: bucket,
    Key: path.basename(file),
    Body: fs.createReadStream(file),
    ACL: 'public-read',
    ContentType
  }).promise().then(({ Location }) => Location);
}

async function transform({ temporaryDirectory }, transform, imagePath) {
  const {
    filename,
    extension,
    name
  } = deriveFromPath(imagePath);

  const image = gm(imagePath);
  const originSize = await promisify(image.size.bind(image))();

  let resizeRatio = 1;

  if (transform.width) {
    resizeRatio = transform.width / originSize.width;

    const transformedSize = {
      width: transform.width,
      height: originSize.height * resizeRatio
    };

    image.resize(transformedSize.width, transformedSize.height);
  }

  const destination = temporaryDirectory + '/' + transform.name.replace('{{name}}', name) + '.' + (transform.extension || 'jpg');

  await promisify(image.write).bind(image)(destination);

  return destination;
}

function deriveFromPath(path) {
  const filename = path.split('/').pop();
  const parts = filename.split('.');
  const extension = parts.pop();
  const name = parts.join('.');
  return {
    filename,
    extension,
    name
  };
}
