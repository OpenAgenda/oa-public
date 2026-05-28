import seedApiKeys from './seedApiKeys.js';
import load from './loadObjectFromFile.js';

export default async (knex) => {
  await knex('user').insert([
    load('sql/users/01.json'),
    load('sql/users/superAdmin.json'),
  ]);

  await seedApiKeys(knex, [
    load('./sql/apiKeys/01-pk.json', { userUid: 838438477721 }),
    load('./sql/apiKeys/01-sk.json', { userUid: 838438477721 }),
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
