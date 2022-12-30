'use strict';

const loadObjectFromFile = require('@openagenda/utils/loadObjectFromFile');

const load = loadObjectFromFile({ cwd: __dirname });

const {
  knex,
  resetAndCreateTables,
} = require('./sql');

const raw = resetAndCreateTables();

raw.push(knex('user').insert([
  load('sql/users/jean-benoit.json', {
    id: 1,
    uid: 1,
  }),
  load('sql/users/steevie.json', {
    id: 2,
    uid: 2,
    last_signin: new Date(),
  }),
  load('sql/users/helene.json', {
    id: 3,
    uid: 3,
    last_signin: new Date('2019-01-01'),
  }),
  load('sql/users/margaux.json', {
    id: 4,
    uid: 4,
    last_signin: new Date('2019-01-01'),
  }),
  load('sql/users/thibaud.json', {
    id: 5,
    uid: 5,
    last_signin: new Date('2019-01-01'),
  }),
  load('sql/users/lise.json', {
    id: 6,
    uid: 6,
    last_signin: new Date('2019-01-01'),
    email: 'lise@openagenda.com',
  }),
]));

module.exports = `${raw.join(';\n')}`;
