'use strict';

const _ = require('lodash');
const fs = require('fs');
const https = require('https');

const axios = require('axios');

const log = require('@openagenda/logs')('compileForValidation');

const fields = require('./fields');
const statusSlugs = fields.find(f => f.field === 'status').options.map(o => o.value);
const fieldNames = fields.filter(f => (f.write || []).includes('public')).map(f => f.field);
const ValidationError = require('./ValidationError');

const replaceAccents = require('@openagenda/utils/replaceAccents');

const isDHM = require('../iso/src/validators/dateHoursMinutesTiming').is;

const removeRegistrationTypes = (registration = []) => registration
  .map(rItem => rItem?.type ? rItem.value : rItem);

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

    compiled.image = await axiosInstance
      .get(image?.url)
      .then(response => response?.data)
      .catch(() => {
        throw new ValidationError({
          field: 'image',
          code: 'url.invalid',
          message: 'provided image url is not valid'
        });
      });
  } else if (image?.path && !('transformAndUpload' in image)) {
    log('image is provided through local filesystem path: %s', image?.path);
    compiled.image = fs.createReadStream(image?.path);
    compiled.image.on('close', () => fs.unlink(image.path, () => {}));
  } else if (image?.filename === null) {
    log('image is unset through filename value %s', image?.filename);
    compiled.image = null;
  } else if (typeof data?.image?.filename === 'string' && !('transformAndUpload' in image)) {
    compiled.image = current?.image || data?.image;
  }

  // edge case: if DHM timings are being validated, their timezone must be
  // known for correctly evaluating time between beginning and end on DST days
  if ((compiled?.timings || []).length && isDHM(compiled.timings[0])) {
    compiled.timings.forEach(t => {
      t.timezone = compiled.timezone;
    });
  }

  if (data?.location instanceof Object && !data?.locationUid) {
    compiled.locationUid = data.location.uid;
    editedFields.push('locationUid');
  }

  if (data?.location === null && !data?.locationUid) {
    compiled.locationUid = null;
    editedFields.push('locationUid');
  }

  if (data?.location instanceof Object && !data?.timezone && data.location.timezone) {
    compiled.timezone = data.location.timezone;
    editedFields.push('timezone');
  }

  if (data.longDescription) {
    compiled.longDescription = replaceAccents(data.longDescription);
  }

  if (data.age && !Object.keys(data.age).filter(k => data.age[k] !== undefined).length) {
    compiled.age = { min: null, max: null };
    editedFields.push('age');
  }

  if (statusSlugs.includes(data?.status)) {
    compiled.status = fields
      .find(f => f.field === 'status')
      .options
      .find(o => o.value === data.status).id;
  }

  if (data?.registration) {
    compiled.registration = removeRegistrationTypes(data.registration);
    editedFields.push('registration');
  }

  return {
    compiled,
    editedFields
  };
}