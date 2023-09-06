'use strict';

const fs = require('fs');
const { promisify } = require('util');
const _ = require('lodash');
const AWS = require('aws-sdk');

const log = require('@openagenda/logs')('agendaFiles');

async function removeAgendaFile(client, bucket, uid, name) {
  const deleteObject = promisify(client.deleteObject.bind(client));

  const result = await deleteObject({
    Bucket: bucket,
    Key: [uid, name].join('/'),
  });

  return result;
}

async function getAgendaFile(client, bucket, uid, name) {
  const getObject = promisify(client.getObject.bind(client));

  const result = await getObject({
    Bucket: bucket,
    Key: [uid, name].join('/'),
  });

  return result.Body;
}

async function setAgendaFile(client, bucket, uid, localFilePath, name = null) {
  const upload = promisify(client.upload.bind(client));

  const result = await upload({
    ACL: 'public-read', // because that is what I need now
    Bucket: bucket,
    Key: [uid, name].join('/'),
    Body: fs.createReadStream(localFilePath),
  });

  return {
    path: result.Location,
  };
}

async function getAgendaJSON(client, bucket, uid, name, defaultValue) {
  try {
    log('fetching agenda JSON state file for agenda %s', uid);

    const result = (await getAgendaFile(client, bucket, uid, name)).toString();

    log('retrieved agenda %s state', uid, result);

    return JSON.parse(result);
  } catch (e) {
    if (e.code === 'NoSuchKey') {
      return _.extend({}, defaultValue);
    }

    throw e;
  }
}

async function setAgendaJSON(client, bucket, uid, name, obj) {
  const putObject = promisify(client.putObject.bind(client));

  return putObject({
    Bucket: bucket,
    Key: [uid, name].join('/'),
    Body: JSON.stringify(obj, null, 2),
    ContentType: 'application/json',
  });
}

module.exports = ({ s3, uid }) => {
  const client = new AWS.S3(
    _.extend(
      {
        apiVersion: '2006-03-01',
      },
      _.pick(s3, ['accessKeyId', 'secretAccessKey', 'region'])
    )
  );

  return {
    setJSON: setAgendaJSON.bind(null, client, s3.bucket, uid),
    getJSON: getAgendaJSON.bind(null, client, s3.bucket, uid),
    get: getAgendaFile.bind(null, client, s3.bucket, uid),
    set: setAgendaFile.bind(null, client, s3.bucket, uid),
    remove: removeAgendaFile.bind(null, client, s3.bucket, uid),
  };
};
