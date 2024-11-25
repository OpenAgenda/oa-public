import { createReadStream } from 'node:fs';
import fs from 'node:fs/promises';
import { promisify } from 'node:util';
import _ from 'lodash';
import AWS from 'aws-sdk';
import multer from 'multer';
import FileType from 'file-type';
import logs from '@openagenda/logs';
import FormSchema from '@openagenda/form-schemas/iso/FormSchema.js';

const log = logs('middleware/files');

// const FILE_FIELD_PREFIX = require('../../iso/fileFieldPrefix');

// set at init
let tmpFolder;
let s3;
let upload;

function putInTemporary(o, req, res, next) {
  const options = {
    fileKey: 'fileKey',
    schema: 'schema',
    fileFieldValues: 'fileFieldValues',
    ignore: [],
    ...o,
  };

  const temporaryFolder = tmpFolder || process.env.TMP_FOLDER;

  if (!temporaryFolder) return next(new Error('form-schemas middleware are not initialized'));

  const fileFields = new FormSchema(req[options.schema], {
    requireLabels: false,
  }).getFileFields();

  req[options.fileFieldValues] = {};

  if (!fileFields.length) {
    log('putInTemporary: there are no file fields in schema');
    return next();
  }

  log('putInTemporary: there are %s file fields in schema', fileFields.length);

  multer({
    storage: multer.diskStorage({
      destination: temporaryFolder,
      filename: (_req, file, cb) => {
        const field = _.first(
          fileFields.filter((f) => f.field === file.fieldname),
        );

        // should use multer file filter here
        if (!field) return cb(null, 'latest_discarded_upload');

        const filename = [
          req[options.fileKey],
          file.fieldname,
          file.originalname.split('.').pop(),
        ].join('.');

        const fieldValue = {
          originalName: file.originalname,
          extension: file.originalname.split('.').pop(),
          filename,
          path: [temporaryFolder, filename].join('/'),
        };

        log('stored field file in temporary folder', field.field, fieldValue);

        req[options.fileFieldValues][field.field] = fieldValue;

        cb(null, filename);
      },
    }),
  }).fields(fileFields.map((f) => ({ name: f.field, maxCount: f.max || 1 })))(
    req,
    res,
    next,
  );
}

function cleanFileValues(o, req, res, next) {
  const options = {
    fileKey: 'fileKey',
    schema: 'schema',
    fileFieldValues: 'fileFieldValues',
    ignore: [],
    ...o,
  };

  const fileFieldValues = req[options.fileFieldValues];

  if (!_.keys(fileFieldValues).length) {
    return next();
  }

  _.keys(fileFieldValues)
    .filter((field) => !options.ignore.includes(field))
    .forEach((fieldName) => {
      req.body[fieldName] = fileFieldValues[fieldName];
    });

  next();
}

async function s3Upload(filename) {
  const stream = await FileType.stream(
    createReadStream(`${tmpFolder}/${filename}`),
  );
  const { fileType } = stream;

  const result = await upload({
    ACL: 'public-read', // because that is what I need now
    Bucket: s3.bucket,
    Key: filename,
    Body: stream,
    ContentType: fileType.mime || 'application/octet-stream',
  });

  return result.Location;
}

async function s3MultipleUploads(fileFieldValues) {
  for (const fieldName of _.keys(fileFieldValues)) {
    const { filename } = fileFieldValues[fieldName];
    const location = await s3Upload(filename);

    log('uploaded %s to s3 location %s', filename, location);

    if (location) {
      await fs.unlink(`${tmpFolder}/${filename}`);
    }
  }
}

/**
 * Upload files found in file values namespace to S3
 */
function uploadFilesToS3(options, req, res, next) {
  const params = _.assign(
    {
      fileFieldValues: 'fileFieldValues',
      ignore: [],
    },
    options || {},
  );

  const fileFieldsValues = _.omit(req[params.fileFieldValues], params.ignore);

  if (!_.keys(fileFieldsValues).length) {
    log('uploadFilesToS3 - did not find any files to upload to s3');
    return next();
  }

  log(
    'uploadFilesToS3 - found %s files to upload to s3',
    _.keys(fileFieldsValues).length,
  );

  s3MultipleUploads(fileFieldsValues).then(next, next);
}

function init(config) {
  tmpFolder = _.get(config, 'tmpFolder');

  s3 = _.get(config, 's3');

  const client = new AWS.S3(
    _.assign(
      {
        apiVersion: '2006-03-01',
      },
      _.pick(config.s3, ['accessKeyId', 'secretAccessKey', 'region']),
    ),
  );

  upload = promisify(client.upload.bind(client));
}

export default {
  init,
  putInTemporary,
  uploadFilesToS3,
  cleanFileValues,
};
