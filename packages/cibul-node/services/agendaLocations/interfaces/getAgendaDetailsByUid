'use strict';

module.exports = (config, services) => (uid, fields) => {
  if (!fields) {
    fields = ['id'];
  };

  const fieldMap = {
    id: 'id',
    locationSetUid: 'location_set_uid'
  };

  return config.knex('review')
    .first(Object.keys(fieldMap).filter(f => fields.includes(f)).map(f => fieldMap[f]))
    .where('uid', uid)
    .then(result => result ? fields.reduce((agenda, field) => ({
      ...agenda,
      [field]: result[fieldMap[field]]
    }), {}) : null);
}
