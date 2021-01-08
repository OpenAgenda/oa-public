'use strict';

const log = require('@openagenda/logs')('update');

const get = require('./get');
const cleanSetOptions = require('./lib/cleanSetOptions');
const filterItemValuesByFieldAccess = require('./lib/filterItemValuesByFieldAccess');
const fromItemToDbEntry = require('./lib/fromItemToDbEntry');
const generateFileKey = require('./lib/generateFileKey');
const validate = require('./lib/validate');
const setLegacy = require('./lib/legacy/set');
const processImage = require('./lib/processImage');
const handleInterface = require('./lib/handleInterface');
const convertDateMinuteHourTimings = require('./lib/convertDateMinuteHourTimings');

async function update({ service, isPatch }, current, data, options = {}) {
  const clean = {
    ...validate(data, { isPatch }),
    updatedAt: new Date()
  };

  if (clean.image) {
    clean.fileKey = generateFileKey();
    clean.image = await processImage(service, clean);
  }

  convertDateMinuteHourTimings(clean.timings, clean.timezone || current.timezone);

  await handleInterface(service, 'beforeUpdate', current, clean, options.context);

  const result = await service.clients.knex(service.config.schema)
    .update(fromItemToDbEntry(clean, current))
    .where('uid', current.uid);

  log('updated event with uid %s', current.uid);

  await handleInterface(service, 'onUpdate', current, clean, options.context);

  try {
    await setLegacy(service.clients.knex, { ...current, ...clean });
  } catch (e) {
    log('warn', 'failed to update legacy', e);
  }

  return {
    ...current,
    ...clean
  }
}

module.exports = async ({ service, isPatch }, identifier, data, options = {}) => update({
  service,
  isPatch
}, await get(service, identifier, { ...options, throwOnError: true }), data, options);
