'use strict';

const loadObjectFromFile = require('@openagenda/utils/loadObjectFromFile');

const {
  knex,
  resetAndCreateTables,
} = require('./sql');

const load = loadObjectFromFile({ cwd: __dirname });

const raw = resetAndCreateTables();

raw.push(knex('user').insert([
  load('./sql/users/01.json'),
]));

raw.push(knex('api_key_set').insert([
  load('./sql/apiKeySets/01.json'),
]));

raw.push(knex('access_token').insert([
  load('./sql/accessTokens/01.json'),
  load('./sql/accessTokens/02.json'),
]));

module.exports = `${raw.join(';\n')};`;
