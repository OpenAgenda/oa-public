'use strict';

const {
  knex,
  resetAndCreateTables
} = require('./sql');

const insertEventSet = require('./sql/eventSets');

const raw = resetAndCreateTables();

raw.push(knex('form_schema').insert([{
  id: 10428,
  store: JSON.stringify(require('./form-schemas/arles.json'))
}]));


raw.push(knex('review').insert([
  require('./sql/agendas/arles.json')
]));

raw.push(knex('network').insert([{
  id: 1,
  uid: 1,
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
  title: 'Un réseau'
}]));

raw.push(knex('user').insert([
  require('./sql/users/janine.json')
]));

raw.push(knex('reviewer').insert([
  require('./sql/members/janine-adm-arles.json')
]));

raw.push(knex('location').insert([
  require('./sql/locations/boutique.json'),
  require('./sql/locations/chezVous.json')
]));


insertEventSet(knex, raw, '6');
insertEventSet(knex, raw, 'videoReportage');


module.exports = raw.join(';\n') + ';';
