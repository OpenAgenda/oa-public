'use strict';

const loadObjectFromFile = require('@openagenda/utils/loadObjectFromFile');

const load = loadObjectFromFile({ cwd: __dirname });

const {
  knex,
  resetAndCreateTables,
} = require('./sql');

const raw = resetAndCreateTables();

raw.push(knex('user').insert([
  load('sql/users/01.json'),
]));

raw.push(knex('network').insert([
  load('sql/networks/01.json'),
]));

raw.push(knex('api_key_set').insert([
  load('sql/apiKeySets/01.json'),
]));

raw.push(knex('access_token').insert([
  load('sql/accessTokens/01.json'),
  load('sql/accessTokens/02.json'),
]));

raw.push(knex('review').insert([
  load('sql/agendas/01.json'),
  load('sql/agendas/02.json'),
  load('sql/agendas/03.json'),
  load('sql/agendas/04.json'),
  load('sql/agendas/05.json'),
]));

raw.push(knex('reviewer').insert([
  load('sql/members/01.json'),
  load('sql/members/02.json'),
  load('sql/members/03.json'),
  load('sql/members/04.json'),
]));

module.exports = `${raw.join(';\n')};`;
