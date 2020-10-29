'use strict';

module.exports = services => setUid => services.knex('review')
  .count('id', { as: 'total' })
  .where('location_set_uid', setUid)
  .then(result => result ? (result.pop() || { total: 0 }).total : null);
