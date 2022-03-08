'use strict';

const {
  knex,
  resetAndCreateTables
} = require('./sql');

const insertEventSet = require('./sql/eventSets');

const raw = resetAndCreateTables();

raw.push(knex('user').insert([
  require('./sql/users/01.json'),
  require('./sql/users/steevie.json'),
  require('./sql/users/jean-benoit.json')
]));

raw.push(knex('review').insert([
  require('./sql/agendas/fete-berlin.json'),
  require('./sql/agendas/fetedelamusique.json')
]));

raw.push(knex('reviewer').insert([
  require('./sql/members/steevie-in-fete-berlin.json'),
  require('./sql/members/jean-benoit-fetedelamusique.json')
]));

insertEventSet(knex, raw, 'wildAtHeart');

raw.push(knex('api_key_set').insert([
  require('./sql/apiKeySets/01.json')
]));

raw.push(knex('access_token').insert([
  require('./sql/accessTokens/01.json'),
  ({
    ...require('./sql/accessTokens/02.json'),
    created_at: new Date()
  })
]));

module.exports = raw.join(';\n') + ';';
