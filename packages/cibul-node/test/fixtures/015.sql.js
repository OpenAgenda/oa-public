'use strict';

const loadObjectFromFile = require('@openagenda/utils/loadObjectFromFile');

const {
  knex,
  resetAndCreateTables,
} = require('./sql');

const load = loadObjectFromFile({ cwd: __dirname });

const raw = resetAndCreateTables();

raw.push(knex('user').insert([
  load('./sql/users/01.json', {
    id: 1,
    uid: 1,
  }),
]));

raw.push(knex('api_key_set').insert([
  load('./sql/apiKeySets/01.json', {
    user_id: 1,
  }),
]));

raw.push(knex('access_token').insert([
  load('./sql/accessTokens/01.json'),
  load('./sql/accessTokens/02.json'),
]));

raw.push(knex('review').insert([
  load('sql/agendas/218.json', {
    uid: 123,
  }),
]));

raw.push(knex('reviewer').insert([
  load('sql/members/kev.admin.json', {
    agenda_uid: 123,
    user_uid: 1,
  }),
]));

raw.push(knex('key').insert([{
  type: 'agendaFullRead',
  identifier: 123,
  created_at: new Date(),
  label: 'Wigglypoof',
  key: 'e830934e9d1848189ac74de3bfa7df0a',
}]));

module.exports = `${raw.join(';\n')};`;
