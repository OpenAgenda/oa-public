'use strict';

exports.seed = async knex => {
  const { schemas } = knex.client.config;

  // Deletes ALL existing entries
  await knex( schemas.rule ).del();

  return knex( schemas.rule ).insert( [
    {
      id: 1,
      entity_name: 'user',
      identifier: 99999999,
      actions: 'receive',
      subject: 'activity',
      inverted: false,
      conditions: null,
      fields: null,
      reason: null
    },
    {
      id: 2,
      entity_name: 'user',
      identifier: 12345678,
      actions: 'receive',
      subject: 'activity',
      inverted: true,
      conditions: '{"verb":"spam","target":"agenda:456"}',
      fields: null,
      reason: null
    }
  ] );
};
