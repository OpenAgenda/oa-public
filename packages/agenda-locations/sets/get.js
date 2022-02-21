'use strict';

const cleanGetOptions = require('./lib/cleanGetOptions');

module.exports = async (service, uid, options = {}) => {
  const { detailed, includeSettings } = cleanGetOptions(options);
  const selectFields = ['uid', 'title'];
  if (includeSettings) {
    selectFields.push('settings');
  }
  const entry = await service.clients.knex
    .first(selectFields)
    .from(service.config.setSchema)
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
    set.agendasCount = await service.interfaces.getSetAgendasCount(uid);

    set.locationsCount = await service.clients.knex
      .count('id', { as: 'total' })
      .from(service.config.schema)
      .where('set_uid', uid)
      .then(r => r.pop().total);
  }

  return set;
};
