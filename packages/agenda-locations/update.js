'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('update');

const cleanOptions = require('./lib/cleanSetOptions');
const get = require('./get');
const validate = require('./lib/validate');
const fromItemToDbEntry = require('./lib/fromItemToDbEntry');
const NotFoundError = require('./lib/NotFoundError');

async function update({ service, isPatch }, current, data, options = {}) {
  log('received %j payload', current.uid);

  const {
    includeImagePath,
    geocodeIfUndefined
  } = cleanOptions(options);

  const geocodeResult = geocodeIfUndefined ? await service.decorateWithGeocodeData(data): null;

  const ignoreImage = current.image && !validate.isStream(data.image);

  if (ignoreImage) {
    log('image is not stream, will be ignored');
  }

  const dataToValidate = geocodeResult ? {
    ...(isPatch ? _.pick(geocodeResult, ['latitude', 'longitude']) : geocodeResult),
    ...data
  } : data;

  const clean = {
    ...validate(dataToValidate, { isPatch, ignoreImage }),
    updatedAt: new Date
  };

  if (current.image && (data.image === null)) {
    clean.image = null;
  } else if (clean.image && !ignoreImage) {
    log('uploading image');
    const result = await service.imageTransformAndUpload(clean.image, { uid: current.uid });

    clean.image = result[0].filename + '?__ts=' + (new Date).getTime();
  } else if (ignoreImage && current.image) {
    clean.image = current.image.split('/').pop();
  }

  // string image means image is unchanged.

  const entry = fromItemToDbEntry(clean, current);

  const result = await service.clients.knex(service.config.schema)
    .update(entry)
    .where('uid', current.uid);

  log('updated location with uid %s', current.uid);

  if (includeImagePath && clean.image) {
    clean.image = service.config.imagePath + clean.image;
  }

  const updated = {
    ...current,
    ...clean
  };

  if (service.interfaces.onUpdate) {
    await service.interfaces.onUpdate(current, updated);
  }

  return updated;
}

module.exports = async ({ service, isPatch }, identifiers, data, options = {}) => {
  const current = await get(service, identifiers, options);
  if (!current) {
    throw NotFoundError('location', identifiers);
  }
  return update({ service, isPatch }, current, data, options);
}

module.exports.byAgendaUid = async (
  { service, isPatch },
  agendaUid,
  identifiers,
  data,
  options = {}
) => {
  const current = await get.byAgendaUid(service, agendaUid, identifiers, options);

  if (!current) {
    throw new NotFoundError('location', { identifiers, agendaUid });
  }

  return update({ service, isPatch }, current, data, options);
}

module.exports.bySetUid = async (
  { service, isPatch },
  setUid,
  identifiers,
  data,
  options = {}
) => {
  const current = await get.bySetUid(service, setUid, identifiers, options);

  if (!current) {
    throw new NotFoundError('location', { identifiers, setUid });
  }

  return update({ service, isPatch }, current, data, options);
}
