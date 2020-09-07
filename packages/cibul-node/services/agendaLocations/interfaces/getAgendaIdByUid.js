'use strict';

module.exports = (config, services) => uid => config.knex('review')
  .first('id')
  .where('uid', uid)
  .then(result => result ? result.id : null);
