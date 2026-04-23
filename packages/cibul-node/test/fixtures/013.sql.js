import loadObjectFromFile from './loadObjectFromFile.js';

const load = loadObjectFromFile({ cwd: import.meta.dirname });

export default async (knex) => {
  await knex('user').insert([
    load('sql/users/01.json'),
    load('sql/users/superAdmin.json'),
  ]);

  await knex('api_key_set').insert([
    load('./sql/apiKeySets/01.json', { user_id: 83530 }),
  ]);

  await knex('review').insert([
    load('sql/agendas/01.json'),
    load('sql/agendas/02.json'),
    load('sql/agendas/03.json'),
    load('sql/agendas/04.json'),
    load('sql/agendas/05.json'),
  ]);

  await knex('network').insert([load('sql/networks/01.json')]);

  await knex('form_schema').insert([
    {
      id: 1,
      store: `{
        "nextOptionId": 1,
        "fields": []
      }`,
    },
  ]);
};
