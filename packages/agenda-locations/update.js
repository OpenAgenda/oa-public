'use strict';

const { NotFound } = require('@openagenda/verror');
const logs = require('@openagenda/logs');

const cleanOptions = require('./lib/cleanSetOptions');
const get = require('./get');
const validate = require('./lib/validate');
const authorize = require('./lib/authorize');
const preCleanBeforeUpdate = require('./lib/preCleanBeforeUpdate');
const { beforeInsert, mergeExtIdsFn } = require('./lib/formatExtIds');

const log = logs('update');

async function update({ service, isPatch }, current, data, options = {}) {
  const {
    decorateWithGeocodeData: { shouldAttempt: shouldAttemptGeocode },
  } = service;

  log('received %j payload', current.uid);
  await authorize(service, 'update', current.uid, options);

  const { includeImagePath, autocomplete, mergeExtIds, fromMerge } = cleanOptions(options);

  const geocodeResult = shouldAttemptGeocode(autocomplete, data, isPatch)
    ? await service.decorateWithGeocodeData(data, current)
    : null;

  const ignoreImage = current.image && !validate.isStream(data.image);

  if (ignoreImage) {
    log('image is not stream, will be ignored');
  }

  const dataToValidate = preCleanBeforeUpdate(data, {
    geocodeResult,
    isPatch,
  });

  const clean = {
    ...validate(dataToValidate, { isPatch, ignoreImage }),
  };

  if (!fromMerge) clean.updatedAt = new Date();

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

  if ((mergeExtIds || isPatch) && current.extIds && clean.extIds) {
    clean.extIds = mergeExtIdsFn(clean, current);
  }

  // string image means image is unchanged.
  const entry = service.fieldUtils.fromItemToEntry(
    beforeInsert(clean),
    current,
  );

  await service.clients
    .knex(service.config.schema)
    .update(entry)
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
    await service.interfaces.onUpdate(current, updated, options.context);
  }
  log(updated);
  return updated;
}

module.exports = async (
  { service, isPatch },
  identifiers,
  data,
  options = {},
) => {
  const current = await get(
    { internals: service, endpoints: {} },
    identifiers,
    options,
  );
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
  options = {},
) => {
  const current = await get.byAgendaUid(
    { internals: service, endpoints: {} },
    agendaUid,
    identifiers,
    options,
  );

  if (!current) {
    throw new NotFound(
      { info: { identifiers, agendaUid } },
      'location not found',
    );
  }

  return update({ service, isPatch }, current, data, options);
};

module.exports.bySetUid = async (
  { service, isPatch },
  setUid,
  identifiers,
  data,
  options = {},
) => {
  const current = await get.bySetUid(
    { internals: service, endpoints: {} },
    setUid,
    identifiers,
    options,
  );

  if (!current) {
    throw new NotFound({ info: { identifiers, setUid } }, 'location not found');
  }

  return update({ service, isPatch }, current, data, options);
};
