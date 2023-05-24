'use strict';

exports.seed = async knex => {
  const { schemas } = knex.client.config;

  // Deletes ALL existing entries
  await knex(schemas.feed).del();

  await knex(schemas.feed).insert([
    {
      "id": 2,
      "entity_type": "user",
      "entity_uid": 42
    },
    {
      "id": 4,
      "entity_type": "user",
      "entity_uid": 44
    },
    {
      "id": 5,
      "entity_type": "user",
      "entity_uid": 45
    },
    {
      "id": 6,
      "entity_type": "user",
      "entity_uid": 46
    },
    {
      "id": 7,
      "entity_type": "user",
      "entity_uid": 47
    },
    {
      "id": 8,
      "entity_type": "user",
      "entity_uid": 48
    },
    {
      "id": 9,
      "entity_type": "user",
      "entity_uid": 49
    },
    {
      "id": 10,
      "entity_type": "user",
      "entity_uid": 50
    },
    {
      "id": 11,
      "entity_type": "user",
      "entity_uid": 51
    },
    {
      "id": 12,
      "entity_type": "agenda",
      "entity_uid": 86
    }
  ]);
};
