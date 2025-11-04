import logs from '@openagenda/logs';

import get from './get.js';
import cleanSetOptions from './lib/cleanSetOptions.js';
import generateFileKey from './lib/generateFileKey.js';
import validate from './lib/validate.js';
import processImage from './lib/processImage.js';
import handleInterface from './lib/handleInterface.js';
import lastClean from './lib/lastEventClean.js';
import convertAndInjectTimingsWithTimezone from './utils/convertAndInjectTimingsWithTimezone.js';

const log = logs('update');

async function update({ service, isPatch }, current, data, o = {}) {
  const options = cleanSetOptions(o);
  log('received payload for %s: %j', isPatch ? 'patch' : 'update', data);

  const clean = {
    ...await validate(data, {
      isPatch,
      isDraft: options.draft,
      protected: options.protected,
      mergeExtIds: options.mergeExtIds,
      maxImageSize: service.config.maxImageSize,
      current,
    }),
    updatedAt: new Date(),
  };

  if (clean.image) {
    clean.fileKey = generateFileKey();
    clean.image = await processImage(service, {
      image: clean.image,
      fileKey: clean.fileKey,
    });
  }

  if (!options.draft && current.draft) {
    clean.draft = false;
  }

  if (options.useProvidedIdentifiers) {
    Object.assign(clean, {
      uid: data.uid,
      slug: data.slug,
    });
  }

  if (clean.timings !== undefined) {
    clean.timings = convertAndInjectTimingsWithTimezone(
      clean.timings,
      clean.timezone,
    );
  }

  const updated = {
    ...current,
    ...clean,
  };

  await handleInterface(
    service,
    'beforeUpdate',
    current,
    updated,
    options.context,
  );

  await service.clients
    .knex(service.config.schema)
    .update(service.fieldUtils.fromItemToEntry(clean, current))
    .where('uid', current.uid);

  log('updated event with uid %s', current.uid);

  await handleInterface(service, 'onUpdate', current, updated, options.context);

  return lastClean(updated, {
    ...options,
    locations: options.detailed
      ? await handleInterface(service, 'getLocations', updated.locationUid)
      : null,
    agendas: options.detailed
      ? await handleInterface(service, 'getOriginAgendas', updated.agendaUid, {
        private: options.private,
      })
      : null,
    imagePath: service.config.imagePath,
  });
}

export default async ({ service, isPatch }, identifier, data, options = {}) =>
  update(
    {
      service,
      isPatch,
    },
    await get(service, identifier, {
      ...options,
      throwOnError: true,
      internal: true,
    }),
    data,
    options,
  );
