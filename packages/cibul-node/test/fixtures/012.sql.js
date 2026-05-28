import seedApiKeys from './seedApiKeys.js';
import load from './loadObjectFromFile.js';

export default async (knex) => {
  await knex('user').insert([load('sql/users/01.json')]);

  await knex('network').insert([load('sql/networks/01.json')]);

  await seedApiKeys(knex, [
    load('sql/apiKeys/01-pk.json'),
    load('sql/apiKeys/01-sk.json'),
  ]);

  await knex('access_token').insert([
    load('sql/accessTokens/01.json'),
    load('sql/accessTokens/02.json'),
  ]);

  await knex('review').insert([
    load('sql/agendas/01.json'),
    load('sql/agendas/02.json'),
    load('sql/agendas/03.json'),
    load('sql/agendas/04.json'),
    load('sql/agendas/05.json'),
  ]);

  await knex('reviewer').insert([
    load('sql/members/01.json'),
    load('sql/members/02.json'),
    load('sql/members/03.json'),
    load('sql/members/04.json'),
  ]);
};
