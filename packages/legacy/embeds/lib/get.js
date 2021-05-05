'use strict';

const unserialize = require('locutus/php/var/unserialize');

module.exports = internals => async uid => internals
  .knex('review_embed')
  .first('*')
  .where('uid', uid)
  .then(result => {
    if (!result) return null;

    return {
      uid,
      template: JSON.parse(result.template),
      config: unserialize(result.store)
    };
  });
