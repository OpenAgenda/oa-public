import seedApiKeys from './seedApiKeys.js';
import load from './loadObjectFromFile.js';
import insertEventSet from './sql/eventSets/index.js';

export default async (knex) => {
  await knex('user').insert([
    load('sql/users/01.json'),
    load('sql/users/steevie.json'),
    load('sql/users/jean-benoit.json'),
  ]);

  await knex('review').insert([
    load('sql/agendas/fete-berlin.json'),
    load('sql/agendas/fetedelamusique.json'),
  ]);

  await knex('reviewer').insert([
    load('sql/members/steevie-in-fete-berlin.json'),
    load('sql/members/jean-benoit-fetedelamusique.json'),
  ]);

  await insertEventSet(knex, 'wildAtHeart');

  await seedApiKeys(knex, [
    load('sql/apiKeys/01-pk.json'),
    load('sql/apiKeys/01-sk.json'),
  ]);

  await knex('access_token').insert([
    load('sql/accessTokens/01.json'),
    {
      ...load('sql/accessTokens/02.json'),
      created_at: new Date(),
    },
  ]);
};
