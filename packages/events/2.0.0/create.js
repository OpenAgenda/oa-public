'use strict';

const log = require('@openagenda/logs')('create');

const validate = require('./lib/validate');
const cleanSetOptions = require('./lib/cleanSetOptions');
const defineUnique = require('./lib/defineUnique');
const fromItemToDbEntry = require('./lib/fromItemToDbEntry');
const filterItemValuesByFieldAccess = require('./lib/filterItemValuesByFieldAccess');
const generateSlug = require('./lib/generateSlug');
const setLegacy = require('./lib/legacy/set');
const generateFileKey = require('./lib/generateFileKey');
const processImage = require('./lib/processImage');
const handleInterface = require('./lib/handleInterface');
const convertDateMinuteHourTimings = require('./lib/convertDateMinuteHourTimings');

module.exports = async (service, data, options = {}) => {
  const {
    userUid,
    agendaUid
  } = cleanSetOptions(options);

  const clean = validate(data, {
    isDraft: options.draft 
  });

  Object.assign(clean, {
    slug: await generateSlug(service, clean),
    uid: await defineUnique(service, 'uid', () => Math.ceil(Math.random() * 99999999)),
    agendaUid,
    updatedAt: new Date(),
    createdAt: new Date(),
    fileKey: generateFileKey(),
    draft: options.draft
  });

  convertDateMinuteHourTimings(clean.timings, clean.timezone);

  if (userUid) {
    Object.assign(clean, {
      creatorUid: userUid,
      ownerUid: userUid
    });
  }

  if (clean.image) {
    clean.image = await processImage(service, clean);
  }

  await handleInterface(service, 'beforeCreate', clean, options.context);
  
  const entry = fromItemToDbEntry(clean);

  const [insertedID] = await service.clients
    .knex(service.config.schema)
    .insert(entry);

  log('created with id %s and uid %s', insertedID, entry.uid);

  try {
    await setLegacy(service, clean);
  } catch (e) {
    log('warn', 'failed to create legacy', e);
  }

  await handleInterface(service, 'onCreate', clean, options.context);

  return filterItemValuesByFieldAccess(clean);
}
