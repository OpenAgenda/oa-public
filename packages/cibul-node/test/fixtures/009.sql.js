'use strict'

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

raw.push(knex('review').insert([
  require('./sql/agendas/01.json'),
  require('./sql/agendas/02.json')
]));

raw.push(knex('reviewer').insert([
  require('./sql/members/01.json'),
  require('./sql/members/02.json'),
  require('./sql/members/03.json'),
  require('./sql/members/04.json'),
  require('./sql/members/05.json'),
  require('./sql/members/06.json'),
  require('./sql/members/07.json'),
  require('./sql/members/08.json')
]));

module.exports = raw.join(';\n') + ';';
