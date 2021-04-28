'use strict';

const {
  knex,
  resetAndCreateTables
} = require('./sql');

const raw = resetAndCreateTables();

raw.push(knex('user').insert([
  require('./sql/users/01.json')
]));

raw.push(knex('network').insert([
  require('./sql/networks/01.json')
]));

raw.push(knex('api_key_set').insert([
  require('./sql/apiKeySets/01.json')
]));

raw.push(knex('access_token').insert([
  require('./sql/accessTokens/01.json'),
  require('./sql/accessTokens/02.json')
]));

raw.push(knex('review').insert([
  require('./sql/agendas/01.json'),
  require('./sql/agendas/02.json'),
  require('./sql/agendas/03.json'),
  require('./sql/agendas/04.json'),
  require('./sql/agendas/05.json')
]));

raw.push(knex('reviewer').insert([
  require('./sql/members/01.json'),
  require('./sql/members/02.json'),
  require('./sql/members/03.json'),
  require('./sql/members/04.json'),
]));

module.exports = raw.join(';\n') + ';';
