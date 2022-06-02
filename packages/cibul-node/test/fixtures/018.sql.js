'use strict';

const fs = require('fs');

const {
  knex,
  resetAndCreateTables
} = require('./sql');

const load = (path, data = {}) => ({
  ...JSON.parse(fs.readFileSync(`${__dirname}/${path}`, 'utf-8')),
  ...data
});

const raw = resetAndCreateTables();

raw.push(knex('user').insert([
  load('sql/users/jean-benoit.json'),
  load('sql/users/steevie.json', { id: 1002 })
]));

raw.push(knex('review').insert([
  load('sql/agendas/fetedelamusique.json')
]));

raw.push(knex('reviewer').insert([
  load('sql/members/jean-benoit-fetedelamusique.json')
]));

raw.push(knex('api_key_set').insert([
  load('sql/apiKeySets/01.json', { user_id: 1002 })
]));

module.exports = `${raw.join(';\n')};`;
