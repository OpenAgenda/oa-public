'use strict';

module.exports = (knex, uid) => knex('review')
  .first('id')
  .where('uid', uid)
  .then(r => r ? r.id : null);
