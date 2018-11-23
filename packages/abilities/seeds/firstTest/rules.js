'use strict';

exports.seed = async knex => {
  const { schemas } = knex.client.config;

  // Deletes ALL existing entries
  await knex( schemas.rule ).del();

  return knex( schemas.rule ).insert( [
    {
      entity_name: 'user',
      identifier: 99999999,
      actions: 'receive',
      subject: 'eventUpdate',
      inverted: false,
      conditions: null,
      fields: null,
      reason: null
    },
    {
      entity_name: 'member',
      identifier: 60815,
      actions: 'receive',
      subject: 'eventUpdate',
      inverted: true,
      conditions: null,
      fields: null,
      reason: null
    },
    {
      entity_name: 'member',
      identifier: 60815,
      actions: 'receive',
      subject: 'mail',
      inverted: false,
      conditions: '{"verb":"agenda.eventPublished"}',
      fields: null,
      reason: null
    },
    {
      entity_name: 'agenda',
      identifier: 48959239,
      actions: 'receive',
      subject: 'mail',
      inverted: true,
      conditions: '{"verb":"agenda.eventPublished"}',
      fields: null,
      reason: null
    }
  ] );
};
