import load from './loadObjectFromFile.js';

export default async (knex) => {
  await knex('review').insert([
    load('sql/agendas/218.json'), // 17026855
    load('sql/agendas/219.json', {
      // 55268170
      settings: JSON.stringify({
        contribution: {
          type: 1,
          defaultState: 2,
        },
      }),
    }),
    load('sql/agendas/220.json'), // 58025176
    load('sql/agendas/221.json'), // 17026800
    load('sql/agendas/222.json'), // 55278973
  ]);

  await knex('user').insert([
    load('sql/users/janine.json'), // uid 1 / janine
    load('sql/users/50304.json'), // uid 63170203 / steve
    load('sql/users/50300.json'), // uid 63170200 / janine
  ]);

  await knex('api_key_set').insert([
    load('sql/apiKeySets/01.json', { user_id: 50304 }),
    load('sql/apiKeySets/02.json', { user_id: 50300 }),
  ]);

  await knex('form_schema').insert([
    load('form-schemas/1.json', (fs) => ({ id: 2, store: JSON.stringify(fs) })),
    {
      id: 3,
      store: JSON.stringify({
        fields: [],
        nextOptionId: 1,
      }),
    },
    load('form-schemas/7.json', (fs) => ({ id: 7, store: JSON.stringify(fs) })),
  ]);

  await knex('reviewer').insert([
    load('sql/members/71385.json'), // user: 63170203 (steve) | agenda 17026855
    load('sql/members/71386.json'), // user: 63170200 (janine 2) | agenda 17026855
    load('sql/members/71388.json'), // user: 1 (janine 1) | agenda 55268170
    load('sql/members/71387.json', {
      user_uid: 63170200, // janine 2
      agenda_uid: 58025176,
    }),
    load('sql/members/71389.json'), // user: 63170200 (janine 2) | agenda 17026800
  ]);

  await knex('aggregator').insert([
    load('sql/aggregators/1.json'),
    load('sql/aggregators/2.json'),
  ]);

  await knex('aggregator_source').insert([
    load('sql/aggregatorSources/1.json'),
    load('sql/aggregatorSources/2.json'), // 17026800 -> 55278973
  ]);

  await knex('location').insert([load('sql/locations/1.json')]);
};
