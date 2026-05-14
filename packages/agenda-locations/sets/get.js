import cleanGetOptions from './lib/cleanGetOptions.js';

export default async (service, uid, options = {}) => {
  const { detailed, includeSettings } = cleanGetOptions(options);
  const { clients, config, interfaces } = service;

  const selectFields = ['uid', 'title'];
  if (includeSettings) {
    selectFields.push('settings');
  }
  const entry = await clients.knex
    .first(selectFields)
    .from(config.setSchema)
    .where('uid', uid);

  if (!entry) return null;

  const set = {
    uid: entry.uid,
    title: entry.title,
  };
  if (includeSettings) {
    set.settings = entry.settings ? JSON.parse(entry.settings) : {};
  }

  if (detailed) {
    set.agendasCount = await interfaces.getSetAgendasCount(uid);

    set.locationsCount = await clients.knex
      .count('id', { as: 'total' })
      .from(config.schema)
      .where('set_uid', uid)
      .where('deleted', '<>', 1)
      .then((r) => r.pop().total);
  }

  return set;
};
