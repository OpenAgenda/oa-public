'use strict';

const fs = require('fs');

const {
  knex,
  resetAndCreateTables
} = require('./sql');

const insertEventSet = require('./sql/eventSets');

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
  require('./sql/agendas/218.json'),
  require('./sql/agendas/219.json')
]));

raw.push(knex('reviewer').insert([
  require('./sql/members/71385.json'),
  require('./sql/members/71386.json'),
  require('./sql/members/71387.json'),
  require('./sql/members/71388.json')
]));

raw.push(knex('location_set').insert([
  require('./sql/locations/set.json')
]));

raw.push(knex('location').insert([
  require('./sql/locations/1.json'),
  require('./sql/locations/2.json'),
  require('./sql/locations/3.json'),
  require('./sql/locations/4.json'),
  require('./sql/locations/5.json'),
  require('./sql/locations/6.json'),
  require('./sql/locations/7.json'),
  require('./sql/locations/8.json'),
  require('./sql/locations/9.json')
]));

insertEventSet(knex, raw, 3);
insertEventSet(knex, raw, 4);
insertEventSet(knex, raw, 5);
insertEventSet(knex, raw, 7);

raw.push(knex('form_schema').insert([{
  id: 2,
  store: fs.readFileSync(`${__dirname}/form-schemas/1.json`)
}, {
  id: 3,
  store: JSON.stringify({
    fields: [],
    nextOptionId: 1
  })
}]));

module.exports = raw.join(';\n') + ';';
