import fs from 'node:fs';
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import logs from '@openagenda/logs';

const log = logs('agendaFiles');

async function removeAgendaFile(client, bucket, uid, name) {
  return client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: [uid, name].join('/'),
    }),
  );
}

async function getAgendaFile(client, bucket, uid, name) {
  const result = await client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: [uid, name].join('/'),
    }),
  );

  return Buffer.from(await result.Body.transformToByteArray());
}

async function setAgendaFile(client, bucket, uid, localFilePath, name = null) {
  const upload = new Upload({
    client,
    params: {
      ACL: 'public-read', // because that is what I need now
      Bucket: bucket,
      Key: [uid, name].join('/'),
      Body: fs.createReadStream(localFilePath),
      ContentType:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    },
  });

  const result = await upload.done();

  return {
    path: result.Key,
  };
}

async function getAgendaJSON(client, bucket, uid, name, defaultValue) {
  try {
    log('fetching agenda JSON state file for agenda %s', uid);

    const result = (await getAgendaFile(client, bucket, uid, name)).toString();

    log('retrieved agenda %s state', uid, result);

    return JSON.parse(result);
  } catch (e) {
    if (e.Code === 'NoSuchKey') {
      return { ...defaultValue };
    }

    throw e;
  }
}

async function setAgendaJSON(client, bucket, uid, name, obj) {
  return client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: [uid, name].join('/'),
      Body: JSON.stringify(obj, null, 2),
      ContentType: 'application/json',
    }),
  );
}

export default ({ s3, uid }) => {
  const {
    endpoint,
    region,
    // projectId,
    accessKeyId,
    secretAccessKey,
    bucket,
  } = s3;

  const client = new S3Client({
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
    setJSON: setAgendaJSON.bind(null, client, bucket, uid),
    getJSON: getAgendaJSON.bind(null, client, bucket, uid),
    get: getAgendaFile.bind(null, client, bucket, uid),
    set: setAgendaFile.bind(null, client, bucket, uid),
    remove: removeAgendaFile.bind(null, client, bucket, uid),
  };
};
