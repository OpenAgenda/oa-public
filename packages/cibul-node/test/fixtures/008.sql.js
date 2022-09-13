'use strict';

const fs = require('fs');

const {
  knex,
  resetAndCreateTables
} = require('./sql');

const raw = resetAndCreateTables();

raw.push(knex('review').insert([{
  id: 218,
  uid: 17026855,
  title: 'La Gargouille',
  slug: 'la-gargouille',
  indexed: 0,
  description: 'Une petite description',
  owner_id: 50304,
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
  official: 0,
  private: 0,
  credentials: '{}',
  form_schema_id: 2,
  settings: JSON.stringify({
    contribution: {
      type: 1
    }
  })
}, {
  id: 219,
  uid: 17026800,
  title: 'Le Fennec',
  slug: 'le-fennec',
  indexed: 1,
  description: 'Une petite description',
  owner_id: 50304,
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
  official: 0,
  credentials: '{}',
  form_schema_id: 3,
  settings: JSON.stringify({}),
}, {
  id: 220,
  uid: 92983929,
  title: 'Un agenda avec un champ contributeur',
  slug: 'agenda-champ-contributeur',
  indexed: 1,
  description: 'Voilà',
  owner_id: 50304,
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
  official: 0,
  credentials: '{}',
  form_schema_id: 6,
  network_uid: 1234,
  location_set_uid: 4321,
  settings: JSON.stringify({}),
  member_schema_id: 8,
}]));

raw.push(knex('user').insert([
  require('./sql/users/50304.json'),
  require('./sql/users/50300.json')
]));

raw.push(knex('api_key_set').insert([
  { ...require('./sql/apiKeySets/01.json'), user_id: 50304 },
  require('./sql/apiKeySets/02.json')
]));

raw.push(knex('reviewer').insert([
  require('./sql/members/71386687.json')
]));

raw.push(knex('network').insert([{
  id: 1,
  uid: 1234,
  title: 'Un réseau avec un champ admin',
  form_schema_id: 5,
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06'
}]));

raw.push(knex('location_set').insert([{
  uid: 4321,
  title: 'Un jeu de lieux de test',
  created_at: new Date(),
  updated_at: new Date()
}]));

raw.push(knex('form_schema').insert([2, 5, 6, 8].map(id => ({
  id,
  store: fs.readFileSync(`${__dirname}/form-schemas/${id}.json`)
}))));

module.exports = raw.join(';\n') + ';';
