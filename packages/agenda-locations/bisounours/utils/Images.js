'use strict';

const log = require('@openagenda/logs')('Images');

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
    transforms,
    ContentType
  } = {
    ContentType: 'image/jpeg',
    aws: {
      key: null,
      secret: null,
      bucket: null
    },
    temporaryDirectory: '/tmp/',
    transforms: [],
    ...config
  };

  const s3Client = new S3({
    accessKeyId: aws.key,
    secretAccessKey: aws.secret,
    apiVersion: '2006-03-01'
  });

  const methods = {
    transform: (path, name) => Promise.all(transforms.map(t => transform({ temporaryDirectory }, t, path, name))),
    removeUploaded: removeUploaded.bind(null, { client: s3Client, bucket: aws.bucket }),
    renameUploaded: renameUploaded.bind(null, { client: s3Client, bucket: aws.bucket, ContentType }),
    renameUploadedTransforms: renameUploadedTransforms.bind(null, { transforms, client: s3Client, bucket: aws.bucket, ContentType }),
    upload: upload.bind(null,{ client: s3Client, bucket: aws.bucket, ContentType }),
    multer: multer({ dest: temporaryDirectory }).single('image')
  };

  return Object.assign(async (path, name) => {
    const transformed = await methods.transform(path, name);

    const urls = await methods.upload(transformed);

    await Promise.all([path].concat(transformed).map(f => promisify(fs.unlink)(f)));

    return urls;
  }, methods);
}

async function renameUploadedTransforms({ transforms, client, bucket, ContentType }, name, newName, extension = '.jpg') {
  const clean = {
    name: name.split('.').shift(),
    newName: newName.split('.').shift()
  };
  return Promise.all(transforms.map(t => ({
    from: t.name.replace('{{name}}', clean.name) + extension,
    to: t.name.replace('{{name}}', clean.newName) + extension
  })).map(async ({ from, to }) => renameUploaded({ client, bucket, ContentType }, from, to )));
}

async function renameUploaded({ client, bucket, ContentType }, filename, newFilename) {
  log('renaming uploaded %s to %s', filename, newFilename);
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
  if (file instanceof Array) {
    return Promise.all(file.map(f => upload({ client, bucket, ContentType }, f)));
  }
  return client.upload({
    Bucket: bucket,
    Key: path.basename(file),
    Body: fs.createReadStream(file),
    ACL: 'public-read',
    ContentType
  }).promise().then(({ Location }) => Location);
}

async function transform({ temporaryDirectory }, transform, imagePath, name = null) {
  const {
    filename,
    extension,
    name: nameFromPath
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

  const destination = temporaryDirectory + transform.name.replace('{{name}}', name || nameFromPath) + '.' + (transform.extension || 'jpg');

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
