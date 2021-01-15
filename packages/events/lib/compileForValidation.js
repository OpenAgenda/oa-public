'use strict';

const _ = require('lodash');
const fs = require('fs');
const https = require('https');

const axios = require('axios');

const log = require('@openagenda/logs')('compileForValidation');

const fields = require('./fields');
const fieldNames = fields.filter(f => (f.write || []).includes('public')).map(f => f.field);

module.exports = async (current, data, options = {}) => {
  const {
    maxImageSize
  } = {
    maxImageSize: 20971520,
    ...options
  };

  const editedFields = Object.keys(_.omit(data, ['draft'])).filter(f => fieldNames.includes(f));

  const compiled = {
    ...(current || {}),
    ...data
  };

  const image = data?.image;

  if (image?.url) {
    log('image is provided as url %s', image?.url);
    const axiosInstance = axios.create({
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      }),
      headers: {
        'User-Agent': 'OA',
        'Accept-Charset': '*',
        Accept: '*/*'
      },
      timeout: 10000,
      responseType: 'stream',
      maxContentLength: maxImageSize
    });

    compiled.image = await axiosInstance.get(image?.url).then(response => response?.data);
  } else if (image?.path && !('transformAndUpload' in image)) {
    log('image is provided through local filesystem path: %s', image?.path);
    compiled.image = fs.createReadStream(image?.path);
    compiled.image.on('close', () => fs.unlink(image.path, () => {}));
  } else if (image?.filename === null) {
    log('image is unset through filename value %s', image?.filename);
    compiled.image = null;
  } else if (typeof data?.image?.filename === 'string' && !('transformAndUpload' in image)) {
    compiled.image = current?.image;
  }

  if (typeof data?.location === 'object' && !data?.locationUid) {
    compiled.locationUid = data.location.uid;
    editedFields.push('locationUid');
  }

  return {
    compiled,
    editedFields
  };
}