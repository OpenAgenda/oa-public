import logs from '@openagenda/logs';

import validate from './lib/validate.js';
import cleanSetOptions from './lib/cleanSetOptions.js';
import defineUnique from './lib/defineUnique.js';
import generateSlug from './lib/generateSlug.js';
import generateFileKey from './lib/generateFileKey.js';
import processImage from './lib/processImage.js';
import handleInterface from './lib/handleInterface.js';
import lastClean from './lib/lastEventClean.js';
import convertAndInjectTimingsWithTimezone from './utils/convertAndInjectTimingsWithTimezone.js';

const log = logs('create');

export default async (service, data, o = {}) => {
  log('processing');
  const options = cleanSetOptions(o);

  const { context, private: privateOption, fileKey } = options;

  const { agendaUid, userUid } = context;

  const clean = await validate(data, {
    isDraft: options.draft,
    maxImageSize: service.config.maxImageSize,
  });

  Object.assign(clean, {
    slug: await generateSlug(service, clean),
    uid: await defineUnique(service, 'uid', () =>
      Math.ceil(Math.random() * 99999999)),
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

  clean.timings = convertAndInjectTimingsWithTimezone(
    clean.timings,
    clean.timezone,
  );

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

  await handleInterface(service, 'onCreate', clean, options.context);

  return lastClean(clean, {
    ...options,
    locations: options.detailed
      ? await handleInterface(service, 'getLocations', clean.locationUid)
      : null,
    agendas: options.detailed
      ? await handleInterface(service, 'getOriginAgendas', clean.agendaUid, {
        private: privateOption,
      })
      : null,
    imagePath: service.config.imagePath,
  });
};
