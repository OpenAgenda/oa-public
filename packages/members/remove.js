import logs from '@openagenda/logs';
import cleanRemoveOptions from './lib/cleanRemoveOptions.js';
import get from './get.js';
import invalidateListCache from './lib/invalidateListCache.js';

const log = logs('remove');

export default async (config, identifiers, options = {}) => {
  const { knex, schema, interfaces } = config;

  const { context } = cleanRemoveOptions(options);

  const member = await get(config, identifiers);

  if (!member) throw new Error('Not found');

  await knex(schema).delete().where('id', member.id);

  await invalidateListCache(config, member.agendaUid);

  if (interfaces?.onRemove) {
    try {
      await interfaces.onRemove(member, context);
    } catch (e) {
      log('error', 'interface onRemove exception for member %s', member.id, e);
    }
  }

  return {
    success: true,
  };
};
