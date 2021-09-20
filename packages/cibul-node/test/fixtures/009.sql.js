'use strict';

const {
  knex,
  resetAndCreateTables
} = require('./sql');

const raw = resetAndCreateTables();

raw.push(knex('user').insert([
  require('./sql/users/01.json'), // user id 1, uid 1
  require('./sql/users/thibaud.json'),
  require('./sql/users/lise.json'),
  require('./sql/users/chrissie.json')
]));

raw.push(knex('api_key_set').insert([
  require('./sql/apiKeySets/01.json'), // user id 1
  require('./sql/apiKeySets/lise.keys.json'),
  require('./sql/apiKeySets/chrissie.keys.json')
]));

raw.push(knex('review').insert([
  require('./sql/agendas/01.json'), // uid 1
  require('./sql/agendas/02.json') // uid 2
]));

raw.push(knex('reviewer').insert([
  require('./sql/members/01.json'), // user id 1, user 1, agenda uid 2, contributor
  require('./sql/members/02.json'), // user uid 1, agenda uid 3, moderator
  require('./sql/members/03.json'), // uid 1, id 1, agenda uid 9, administrator
  require('./sql/members/04.json'), // contributor agenda uid 11
  require('./sql/members/05.json'), // uid 5, agenda uid 2
  require('./sql/members/06.json'),
  require('./sql/members/07.json'),
  require('./sql/members/08.json'),
  require('./sql/members/lise.administrator.json')
]));

module.exports = raw.join(';\n') + ';';
