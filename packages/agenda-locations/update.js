'use strict';

const { NotFound } = require('@openagenda/verror');

const cleanOptions = require('./lib/cleanSetOptions');
const get = require('./get');
const validate = require('./lib/validate');
const authorize = require('./lib/authorize');
const preCleanBeforeUpdate = require('./lib/preCleanBeforeUpdate');
const legacy = require('./lib/legacy');
const log = require('@openagenda/logs')('update');

async function update({ service, isPatch }, current, data, options = {}) {
  log('received %j payload', current.uid);
  await authorize(service, 'update', current.uid, options);

  const { includeImagePath, geocodeIfUndefined } = cleanOptions(options);

  const geocodeResult = geocodeIfUndefined
    ? await service.decorateWithGeocodeData(data)
    : null;

  const ignoreImage = current.image && !validate.isStream(data.image);

  if (ignoreImage) {
    log('image is not stream, will be ignored');
  }

  const dataToValidate = preCleanBeforeUpdate(data, current, {
    geocodeResult,
    isPatch
  });

  const clean = {
    ...validate(dataToValidate, { isPatch, ignoreImage }),
    updatedAt: new Date(),
  };

  if (current.image && data.image === null) {
    clean.image = null;
  } else if (clean.image && !ignoreImage) {
    log('uploading image');
    const result = await service.imageTransformAndUpload(clean.image, {
      uid: current.uid,
    });

    clean.image = `${result[0].filename}?_ts=${new Date().getTime()}`;
  } else if (ignoreImage && current.image) {
    clean.image = current.image.split('/').pop();
  }

  // string image means image is unchanged.
  const entry = service.fieldUtils.fromItemToEntry(clean, current);
  await service.clients
    .knex(service.config.schema)
    .update(legacy.patch(entry, current, service.fieldUtils.fromItemToEntry(current)))
    .where('uid', current.uid);

  log('updated location with uid %s', current.uid);

  if (includeImagePath && clean.image) {
    clean.image = service.config.imagePath + clean.image;
  }

  const updated = {
    ...current,
    ...clean,
  };

  if (service.interfaces.onUpdate) {
    await service.interfaces.onUpdate(current, updated);
  }
  log(updated);
  return updated;
}

module.exports = async (
  { service, isPatch },
  identifiers,
  data,
  options = {}
) => {
  const current = await get({ internals: service, endpoints: {} }, identifiers, options);
  if (!current) {
    throw NotFound({ info: identifiers }, 'location not found');
  }
  return update({ service, isPatch }, current, data, options);
};

module.exports.byAgendaUid = async (
  { service, isPatch },
  agendaUid,
  identifiers,
  data,
  options = {}
) => {
  const current = await get.byAgendaUid(
    { internals: service, endpoints: {} },
    agendaUid,
    identifiers,
    options
  );

  if (!current) {
    throw new NotFound({ info: { identifiers, agendaUid } }, 'location not found');
  }

  return update({ service, isPatch }, current, data, options);
};

module.exports.bySetUid = async (
  { service, isPatch },
  setUid,
  identifiers,
  data,
  options = {}
) => {
  const current = await get.bySetUid({ internals: service, endpoints: {} }, setUid, identifiers, options);

  if (!current) {
    throw new NotFound({ info: { identifiers, setUid } }, 'location not found');
  }

  return update({ service, isPatch }, current, data, options);
};
