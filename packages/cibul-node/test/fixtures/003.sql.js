'use strict';

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
  load('sql/agendas/218.json'), // 17026855
  load('sql/agendas/219.json', { // 55268170
    settings: JSON.stringify({
      contribution: {
        type: 1,
        defaultState: 2,
      },
    }),
  }),
  load('sql/agendas/220.json'), // 58025176
  load('sql/agendas/221.json'), // 17026800
  load('sql/agendas/222.json'), // 55278973
]));

raw.push(knex('user').insert([
  load('sql/users/janine.json'),
  load('sql/users/50304.json'),
  load('sql/users/50300.json'),
]));

raw.push(knex('api_key_set').insert([
  load('sql/apiKeySets/01.json', { user_id: 50304 }),
]));

raw.push(knex('form_schema').insert([
  load('form-schemas/1.json', fs => ({ id: 2, store: JSON.stringify(fs) })),
  {
    id: 3,
    store: JSON.stringify({
      fields: [],
      nextOptionId: 1,
    }),
  },
  load('form-schemas/7.json', fs => ({ id: 7, store: JSON.stringify(fs) })),
]));

raw.push(knex('reviewer').insert([
  load('sql/members/71385.json'),
  load('sql/members/71386.json'),
  load('sql/members/71388.json'),
  load('sql/members/71389.json'),
]));

raw.push(knex('aggregator').insert([
  load('sql/aggregators/1.json'),
  load('sql/aggregators/2.json'),
]));

raw.push(knex('aggregator_source').insert([
  load('sql/aggregatorSources/1.json'),
  load('sql/aggregatorSources/2.json'), // 17026800 -> 55278973
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
