import unserialize from 'locutus/php/var/unserialize.js';

export default ({ agendaUid, includeId }, entry) => {
  const result = {
    uid: entry.uid,
    agendaUid,
    template: JSON.parse(entry.template),
    config: unserialize(entry.store),
  };

  if (includeId) {
    result.id = entry.id;
  }

  return result;
};
