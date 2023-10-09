'use strict';

const log = require('@openagenda/logs')('create');

const validate = require('./lib/validate');
const cleanSetOptions = require('./lib/cleanSetOptions');
const defineUnique = require('./lib/defineUnique');
const generateSlug = require('./lib/generateSlug');
const setLegacy = require('./lib/legacy/set');
const generateFileKey = require('./lib/generateFileKey');
const processImage = require('./lib/processImage');
const handleInterface = require('./lib/handleInterface');
const convertAndInjectTimingsWithTimezone = require('./utils/convertAndInjectTimingsWithTimezone');
const lastClean = require('./lib/lastEventClean');

module.exports = async (service, data, o = {}) => {
  log('processing');
  const options = cleanSetOptions(o);

  const {
    context,
    private: privateOption,
    fileKey,
  } = options;

  const {
    agendaUid,
    userUid,
  } = context;

  const clean = await validate(data, {
    isDraft: options.draft,
    maxImageSize: service.config.maxImageSize,
  });

  Object.assign(clean, {
    slug: await generateSlug(service, clean),
    uid: await defineUnique(service, 'uid', () => Math.ceil(Math.random() * 99999999)),
    agendaUid,
    updatedAt: new Date(),
    createdAt: new Date(),
    fileKey: fileKey || generateFileKey(),
    draft: options.draft,
    private: !!privateOption,
  });

  if (options.useProvidedIdentifiers) {
    Object.assign(clean, {
      uid: data.uid,
      slug: data.slug,
    });
  }

  clean.timings = convertAndInjectTimingsWithTimezone(clean.timings, clean.timezone);

  if (userUid) {
    Object.assign(clean, {
      creatorUid: userUid,
      ownerUid: userUid,
    });
  }

  if (clean.image) {
    clean.image = await processImage(service, clean);
  }

  await handleInterface(service, 'beforeCreate', clean, options.context);

  const entry = service.fieldUtils.fromItemToEntry(clean);

  const [insertedID] = await service.clients
    .knex(service.config.schema)
    .insert(entry);

  log('created with id %s and uid %s', insertedID, entry.uid);

  if (!options.draft && options.transferToLegacy) {
    try {
      await setLegacy(service.clients.knex, clean);
    } catch (e) {
      log('warn', 'failed to create legacy', e);
    }
  }

  await handleInterface(service, 'onCreate', clean, options.context);

  return lastClean(clean, {
    ...options,
    locations: options.detailed ? await handleInterface(service, 'getLocations', clean.locationUid) : null,
    agendas: options.detailed ? await handleInterface(service, 'getOriginAgendas', clean.agendaUid, { private: privateOption }) : null,
    imagePath: service.config.imagePath,
  });
};
