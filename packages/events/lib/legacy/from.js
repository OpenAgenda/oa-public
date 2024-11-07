import loadLegacyEntries from './lib/loadLegacyEntries.js';
import assembleEventFromLegacyEntries from './lib/assembleEventFromLegacyEntries.js';

export default async ({ service, endpoints }, legacyIdentifiers) => {
  const { knex } = service.clients;

  const entries = await loadLegacyEntries(knex, legacyIdentifiers);

  const result = {
    event: await assembleEventFromLegacyEntries(entries),
  };

  if (
    await endpoints.get(result.event.uid, {
      includeFields: ['uid'],
      access: 'internal',
    })
  ) {
    result.operation = 'update';
    result.response = await endpoints.update(result.event.uid, result.event, {
      access: 'internal',
      transferToLegacy: false,
      useProvidedIdentifiers: true,
    });
  } else {
    result.operation = 'create';
    result.response = await endpoints.create(result.event, {
      access: 'internal',
      transferToLegacy: false,
      useProvidedIdentifiers: true,
    });
  }

  return result;
};
