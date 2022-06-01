'use strict';

const serialize = require('locutus/php/var/serialize');
const log = require('@openagenda/logs')('update');

const get = require('./get');
const validate = require('./validate');

module.exports = ({ interfaces, knex }, agendaUid) => async (uid, data = {}) => {
  const embed = await get({ interfaces, knex }, agendaUid, uid, {
    includeId: true,
    throwIfNotFound: true
  });

  log('updating with %j', data);

  const { template, config } = validate(data);

  await knex('review_embed').update({
    store: serialize(config),
    template: JSON.stringify(template),
    updated_at: new Date()
  }).where({
    id: embed.id
  });

  log('update successful');

  return {
    uid,
    agendaUid,
    template,
    config
  };
};
