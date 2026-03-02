'use strict';

const { NotFound } = require('@openagenda/verror');
const logs = require('@openagenda/logs');

const cleanOptions = require('./lib/cleanSetOptions');
const get = require('./get');
const validate = require('./lib/validate');
const authorize = require('./lib/authorize');
const preCleanBeforeUpdate = require('./lib/preCleanBeforeUpdate');
const formatExtIds = require('./lib/formatExtIds');
const filterFieldsByAccess = require('./lib/filterFieldsByAccess');

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

  let dataToValidate = preCleanBeforeUpdate(data, {
    geocodeResult,
    isPatch,
  });
  // CRITICAL: Convert legacy extId to extIds BEFORE validation
  // This ensures validator only sees extIds (which is in schema), not extId (legacy)
  // IMPORTANT: Only convert if extIds is NOT explicitly provided in the original input
  // If both are provided, extIds takes precedence (user explicitly set it)
  if (
    !data.extIds
    && (dataToValidate?.extId || dataToValidate.extId === null)
  ) {
    const { extId } = dataToValidate;
    dataToValidate = { ...dataToValidate };
    delete dataToValidate.extId;
    dataToValidate.extIds = [{ key: 'default', value: extId }];
  }

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

  // Step 1: Prepare clean data - extIds already in array format from validation
  const cleanData = { ...clean };
  // Step 2: Merge extIds if needed (both must be in array format)
  // Note: current.extIds is already in API format from get()
  // Only merge if we actually have extIds (either from conversion or direct input)
  let mergedExtIdsApiFormat = null; // Keep API format for response
  if ((mergeExtIds || isPatch) && current.extIds && cleanData.extIds) {
    mergedExtIdsApiFormat = formatExtIds.mergeExtIdsFn(cleanData, current);
    cleanData.extIds = mergedExtIdsApiFormat;
  } else if (cleanData.extIds) {
    // If extIds provided but no merge needed, use them directly
    mergedExtIdsApiFormat = cleanData.extIds;
  }

  // Step 3: Convert to DB format (keep null values for explicit null setting)
  if (cleanData.extIds) {
    cleanData.extIds = cleanData.extIds.reduce(
      (acc, { key, value }) => {
        acc.identifiers.push(`${key}->${value}`);
        return acc;
      },
      { identifiers: [] },
    );
  }

  // string image means image is unchanged.
  const entry = service.fieldUtils.fromItemToEntry(cleanData, current);

  await service.clients
    .knex(service.config.schema)
    .update(entry)
    .where('uid', current.uid);

  log('updated location with uid %s', current.uid);

  if (includeImagePath && clean.image) {
    clean.image = service.config.imagePath + clean.image;
  }

  // Construct updated object with API-format extIds (not DB format)
  // IMPORTANT: Don't include clean.extIds because it's in DB format after conversion
  const cleanWithoutExtIds = { ...clean };
  delete cleanWithoutExtIds.extIds;

  const updated = {
    ...current,
    ...cleanWithoutExtIds,
    // Use API format extIds if we processed them
    ...mergedExtIdsApiFormat ? { extIds: mergedExtIdsApiFormat } : {},
  };

  if (service.interfaces.onUpdate) {
    await service.interfaces.onUpdate(current, updated, options.context);
  }

  // Apply afterRead formatting (adds legacy extId property) before returning
  return filterFieldsByAccess(formatExtIds.afterRead(updated));
}

module.exports = async (
  { service, isPatch },
  identifiers,
  data,
  options = {},
) => {
  // Ensure extIds is fetched when retrieving current location
  const getOptions = {
    ...options,
    includeFields: options.includeFields || undefined, // Don't restrict fields
  };
  const current = await get(
    { internals: service, endpoints: {} },
    identifiers,
    getOptions,
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
  // Ensure extIds is fetched when retrieving current location
  const getOptions = {
    ...options,
    includeFields: options.includeFields || undefined,
  };
  const current = await get.byAgendaUid(
    { internals: service, endpoints: {} },
    agendaUid,
    identifiers,
    getOptions,
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
  // Ensure extIds is fetched when retrieving current location
  const getOptions = {
    ...options,
    includeFields: options.includeFields || undefined,
  };
  const current = await get.bySetUid(
    { internals: service, endpoints: {} },
    setUid,
    identifiers,
    getOptions,
  );

  if (!current) {
    throw new NotFound({ info: { identifiers, setUid } }, 'location not found');
  }

  return update({ service, isPatch }, current, data, options);
};
