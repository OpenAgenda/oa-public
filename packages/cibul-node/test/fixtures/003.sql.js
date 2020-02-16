'use strict';

const fs = require('fs');

const {
  knex,
  resetAndCreateTables
} = require('./sql');

const raw = resetAndCreateTables();

raw.push(knex('review').insert([
  require('./sql/agendas/218.json'),
  require('./sql/agendas/219.json'),
  require('./sql/agendas/220.json')
]));

raw.push(knex('user').insert([
  require('./sql/users/50304.json'),
  require('./sql/users/50300.json')
]));

raw.push(knex('api_key_set').insert([
  { ...require('./sql/apiKeySets/01.json'), user_id: 50304 }
]));

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

raw.push(knex('reviewer').insert([
  require('./sql/members/71385.json'),
  require('./sql/members/71386.json')
]));

raw.push(knex('aggregator').insert([
  require('./sql/aggregators/1.json')
]));

raw.push(knex('aggregator_source').insert([
  require('./sql/aggregatorSources/1.json')
]));

raw.push(knex('location').insert([
  require('./sql/locations/1.json')
]));

const {
  review_category,
  category_set,
  tag_set
} = require('./sql/legacy/218.json');

raw.push(knex('review_category').insert(review_category));

raw.push(knex('category_set').insert([{
  id: 218,
  store: JSON.stringify(category_set)
}]));

raw.push(knex('tag_set').insert([{
  id: 218,
  store: JSON.stringify(tag_set)
}]));

module.exports = raw.join(';\n') + ';';
