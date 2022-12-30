'use strict';

const loadObjectFromFile = require('@openagenda/utils/loadObjectFromFile');

const load = loadObjectFromFile({
  cwd: __dirname,
});

const {
  knex,
  resetAndCreateTables,
} = require('./sql');

const insertEventSet = require('./sql/eventSets');

const raw = resetAndCreateTables();

raw.push(knex('user').insert([
  load('sql/users/01.json'),
  load('sql/users/steevie.json'),
  load('sql/users/jean-benoit.json'),
]));

raw.push(knex('review').insert([
  load('sql/agendas/fete-berlin.json'),
  load('sql/agendas/fetedelamusique.json'),
]));

raw.push(knex('reviewer').insert([
  load('sql/members/steevie-in-fete-berlin.json'),
  load('sql/members/jean-benoit-fetedelamusique.json'),
]));

insertEventSet(knex, raw, 'wildAtHeart');

raw.push(knex('api_key_set').insert([
  load('sql/apiKeySets/01.json'),
]));

raw.push(knex('access_token').insert([
  load('sql/accessTokens/01.json'),
  {
    ...load('sql/accessTokens/02.json'),
    created_at: new Date(),
  },
]));

module.exports = `${raw.join(';\n')};`;
