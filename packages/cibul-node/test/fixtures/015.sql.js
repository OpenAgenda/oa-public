import load from './loadObjectFromFile.js';

export default async (knex) => {
  await knex('user').insert([
    load('./sql/users/01.json', {
      id: 1,
      uid: 1,
    }),
  ]);

  await knex('api_key_set').insert([
    load('./sql/apiKeySets/01.json', {
      user_id: 1,
    }),
  ]);

  await knex('access_token').insert([
    load('./sql/accessTokens/01.json'),
    load('./sql/accessTokens/02.json'),
  ]);

  await knex('review').insert([
    load('sql/agendas/218.json', {
      uid: 123,
    }),
  ]);

  await knex('reviewer').insert([
    load('sql/members/kev.admin.json', {
      agenda_uid: 123,
      user_uid: 1,
    }),
  ]);

  await knex('key').insert([
    {
      type: 'agendaFullRead',
      identifier: 123,
      created_at: new Date(),
      label: 'Wigglypoof',
      key: 'e830934e9d1848189ac74de3bfa7df0a',
    },
  ]);
};
