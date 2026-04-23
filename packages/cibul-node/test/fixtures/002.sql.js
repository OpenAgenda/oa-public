import load from './loadObjectFromFile.js';

export default async (knex) => {
  await knex('review').insert([
    load('sql/agendas/218.json'),
    load('sql/agendas/219.json'),
    load('sql/agendas/220.json'),
    load('sql/agendas/conges.json'),
    load('sql/agendas/metropole-europeenne-de-lille.json', {
      network_uid: null,
      form_schema_id: 4,
    }),
  ]);

  await knex('user').insert([
    load('sql/users/50304.json'), // steve id 50304, uid 63170203,
    load('sql/users/50300.json'),
    load('sql/users/01.json'), // janine id 1, uid 1,
    load('sql/users/kevin.json'),
    load('sql/users/margaux.json'),
  ]);

  await knex('api_key_set').insert([
    load('sql/apiKeySets/01.json', { user_id: 50304 }),
    load('sql/apiKeySets/02.json', { user_id: 1 }),
  ]);

  await knex('form_schema').insert([
    load('form-schemas/1.json', (fxSchema) => ({
      id: 2,
      store: JSON.stringify(fxSchema),
    })),
    {
      id: 3,
      store: JSON.stringify({
        fields: [],
        nextOptionId: 1,
      }),
    },
    load('form-schemas/conditionalImageRights.schema.json', (fxSchema) => ({
      id: 4,
      store: JSON.stringify(fxSchema),
    })),
  ]);

  await knex('reviewer').insert([
    load('sql/members/71385.json', {
      // steve, contributor on agenda 218 (17026855)
      store: JSON.stringify({
        custom_fields: {
          organization: 'Le Chat Fume',
        },
      }),
    }),
    load('sql/members/71386.json'),
    load('sql/members/lise.contributor.albi.json', {
      id: 789645464,
      agenda_uid: 17026855,
      user_uid: 46863451,
      credential: 1,
    }),
    load('sql/members/kev.admin.json'),
    load('sql/members/kev.admin.json', {
      id: 78946456,
      agenda_uid: 89904399, // MEL
    }),
    load('sql/members/71385.json', {
      // steve, api secret enabled
      id: 84578645,
      agenda_uid: 89904399, // MEL
    }),
  ]);

  await knex('location').insert([
    {
      ...load('sql/locations/1.json'),
      store: JSON.stringify({
        ...JSON.parse(load('sql/locations/1.json').store),
        tags: [
          {
            id: 33,
            label: 'Première participation',
          },
          {
            id: 999,
            label: 'Invalid Tag - Should be filtered',
          },
        ],
      }),
    },
  ]);
};
