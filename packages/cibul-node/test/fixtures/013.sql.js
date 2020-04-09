'use strict';

const {
  knex,
  resetAndCreateTables
} = require('./sql');

const raw = resetAndCreateTables();

raw.push(knex('user').insert([
  require('./sql/users/01.json')
]));

raw.push(knex('review').insert([
  require('./sql/agendas/01.json'),
  require('./sql/agendas/02.json'),
  require('./sql/agendas/03.json'),
  require('./sql/agendas/04.json'),
  require('./sql/agendas/05.json')
]));

raw.push(knex('network').insert([
  require('./sql/networks/01.json')
]));

module.exports = raw.join(';\n') + ';';
