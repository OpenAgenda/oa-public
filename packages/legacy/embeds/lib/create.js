'use strict';

const serialize = require('locutus/php/var/serialize');
const {
  NotFound
} = require('@openagenda/verror');
const defineUnique = require('@openagenda/utils/knex/defineUnique');
const validate = require('./validate');

module.exports = ({ interfaces, knex }, agendaUid) => async data => {
  const agendaId = await interfaces.getAgendaId(agendaUid);
  if (!agendaId) {
    throw new NotFound('agenda id not found for uid %d', agendaUid);
  }
  const uid = await defineUnique(
    knex,
    'review_embed',
    'uid',
    () => Math.ceil(Math.random() * 99999999)
  );
  const { template, config } = validate(data);

  await knex('review_embed').insert({
    review_id: agendaId,
    owner_id: 1,
    uid,
    created_at: new Date(),
    updated_at: new Date(),
    store: serialize(config),
    template,
    mapping: null
  });

  return {
    uid,
    config
  };
};
