'use strict';

const {
  knex,
  resetAndCreateTables
} = require('./sql');

const raw = resetAndCreateTables();

raw.push(knex('user').insert([
  require('./sql/users/01.json')
]));

raw.push(knex('api_key_set').insert([
  require('./sql/apiKeySets/01.json')
]));

raw.push(knex('access_token').insert([
  require('./sql/accessTokens/01.json'),
  require('./sql/accessTokens/02.json')
]));

raw.push(knex('review').insert([
  require('./sql/agendas/218.json')
]));

raw.push(knex('reviewer').insert([
  require('./sql/members/71385.json'),
  require('./sql/members/71386.json'),
  require('./sql/members/71387.json')
]));

raw.push(knex('location').insert([
  require('./sql/locations/1.json'),
  require('./sql/locations/2.json'),
  require('./sql/locations/3.json'),
  require('./sql/locations/4.json'),
  require('./sql/locations/5.json'),
  require('./sql/locations/6.json'),
  require('./sql/locations/7.json')
]));

module.exports = raw.join(';\n') + ';';
