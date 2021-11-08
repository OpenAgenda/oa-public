'use strict';

const log = require('@openagenda/logs')('update');

const get = require('./get');
const cleanSetOptions = require('./lib/cleanSetOptions');
const generateFileKey = require('./lib/generateFileKey');
const validate = require('./lib/validate');
const setLegacy = require('./lib/legacy/set');
const processImage = require('./lib/processImage');
const handleInterface = require('./lib/handleInterface');
const convertDateHoursMinutesTimings = require('./utils/convertDateHoursMinutesTimings');
const lastClean = require('./lib/lastEventClean');

async function update({ service, isPatch }, current, data, o = {}) {
  const options = cleanSetOptions(o);
  log('received payload for %s: %j', isPatch ? 'patch' : 'update', data);

  const clean = {
    ...(await validate(data, {
      isPatch,
      isDraft: options.draft,
      maxImageSize: service.config.maxImageSize,
      current
    })),
    updatedAt: new Date()
  };

  if (clean.image) {
    clean.fileKey = generateFileKey();
    clean.image = await processImage(service, clean);
  }

  if (!options.draft && current.draft) {
    clean.draft = false;
  }

  if (options.useProvidedIdentifiers) {
    Object.assign(clean, {
      uid: data.uid,
      slug: data.slug
    });
  }

  convertDateHoursMinutesTimings(clean.timings, clean.timezone || current.timezone);

  const updated = {
    ...current,
    ...clean
  };

  await handleInterface(service, 'beforeUpdate', current, updated, options.context);

  await service.clients.knex(service.config.schema)
    .update(service.fieldUtils.fromItemToEntry(clean, current))
    .where('uid', current.uid);

  log('updated event with uid %s', current.uid);

  await handleInterface(service, 'onUpdate', current, updated, options.context);

  if (!updated.draft && options.transferToLegacy) {
    try {
      await setLegacy(service.clients.knex, updated);
    } catch (e) {
      log('warn', 'failed to update legacy', e);
    }
  }

  return lastClean(updated, {
    ...options,
    locations: options.detailed ? await handleInterface(service, 'getLocations', updated.locationUid) : null,
    agendas: options.detailed ? await handleInterface(service, 'getOriginAgendas', updated.agendaUid, { private: options.private }) : null,
    imagePath: service.config.imagePath
  });
}

module.exports = async ({ service, isPatch }, identifier, data, options = {}) => update({
  service,
  isPatch
}, await get(service, identifier, { ...options, throwOnError: true }), data, options);
