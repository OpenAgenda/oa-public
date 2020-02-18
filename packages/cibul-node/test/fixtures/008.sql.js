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
  description: 'Une petite description',
  owner_id: 50304,
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
  official: 0,
  credentials: '{}',
  form_schema_id: 3,
  settings: JSON.stringify({})
}, {
  id: 220,
  uid: 92983929,
  title: 'Un agenda avec un champ contributeur',
  slug: 'agenda-champ-contributeur',
  description: 'Voilà',
  owner_id: 50304,
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
  official: 0,
  credentials: '{}',
  form_schema_id: 6,
  network_uid: 1234,
  settings: JSON.stringify({})
}]));

raw.push(knex('user').insert([
  require('./sql/users/50304.json')
]));

raw.push(knex('network').insert([{
  id: 1,
  uid: 1234,
  title: 'Un réseau avec un champ admin',
  form_schema_id: 5
}]));

raw.push(knex('form_schema').insert([2, 5, 6].map(id => ({
  id,
  store: fs.readFileSync(`${__dirname}/form-schemas/${id}.json`)
}))));

module.exports = raw.join(';\n') + ';';
