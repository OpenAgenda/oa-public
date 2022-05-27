'use strict';

const fs = require('fs');

const {
  knex,
  resetAndCreateTables
} = require('./sql');

const loadAndExtendJSON = (path, data = {}) => ({
  ...JSON.parse(fs.readFileSync(`${__dirname}/${path}`, 'utf-8')),
  ...data
});

const raw = resetAndCreateTables();

raw.push(knex('user').insert([
  loadAndExtendJSON('sql/users/jean-benoit.json')
]));

raw.push(knex('review').insert([
  loadAndExtendJSON('sql/agendas/fetedelamusique.json')
]));

raw.push(knex('reviewer').insert([
  loadAndExtendJSON('sql/members/jean-benoit-fetedelamusique.json')
]));

module.exports = `${raw.join(';\n')};`;
