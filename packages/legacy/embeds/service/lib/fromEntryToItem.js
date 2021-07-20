'use strict';

const unserialize = require('locutus/php/var/unserialize');

module.exports = ({
  agendaUid,
  includeId
}, entry) => {
  const result = {
    uid: entry.uid,
    agendaUid,
    template: JSON.parse(entry.template),
    config: unserialize(entry.store)
  };

  if (includeId) {
    result.id = entry.id;
  }

  return result;
};
