'use strict';

const fs = require('fs');
const loadObjectFromFile = require('@openagenda/utils/loadObjectFromFile');

const load = loadObjectFromFile({
  cwd: __dirname,
});

const {
  knex,
  resetAndCreateTables,
} = require('./sql');

const raw = resetAndCreateTables();

raw.push(knex('review').insert([
  load('sql/agendas/218.json'),
  load('sql/agendas/219.json'),
  load('sql/agendas/220.json'),
  load('sql/agendas/conges.json'),
]));

raw.push(knex('user').insert([
  load('sql/users/50304.json'),
  load('sql/users/50300.json'),
  load('sql/users/01.json'),
  load('sql/users/kevin.json'),
]));

raw.push(knex('api_key_set').insert([
  { ...load('sql/apiKeySets/01.json'), user_id: 50304 },
  { ...load('sql/apiKeySets/02.json'), user_id: 1 },
]));

raw.push(knex('form_schema').insert([{
  id: 2,
  store: fs.readFileSync(`${__dirname}/form-schemas/1.json`),
}, {
  id: 3,
  store: JSON.stringify({
    fields: [],
    nextOptionId: 1,
  }),
}]));

raw.push(knex('reviewer').insert([
  load('sql/members/71385.json', {
    store: JSON.stringify({
      custom_fields: {
        organization: 'Le Chat Fume',
      },
    }),
  }),
  load('sql/members/71386.json'),
  load('sql/members/kev.admin.json'),
]));

raw.push(knex('location').insert([
  load('sql/locations/1.json'),
]));

const {
  review_category: reviewCategory,
  category_set: categorySet,
  tag_set: tagSet,
} = require('./sql/legacy/218.json');

raw.push(knex('review_category').insert(reviewCategory));

raw.push(knex('category_set').insert([{
  id: 218,
  store: JSON.stringify(categorySet),
}]));

raw.push(knex('tag_set').insert([{
  id: 218,
  store: JSON.stringify(tagSet),
}]));

module.exports = `${raw.join(';\n')};`;
