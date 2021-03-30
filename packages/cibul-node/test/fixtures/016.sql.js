'use strict';

const fs = require('fs');

const {
  knex,
  resetAndCreateTables
} = require('./sql');

const insertEventSet = require('./sql/eventSets');

const raw = resetAndCreateTables();

raw.push(knex('user').insert([
  require('./sql/users/thibaud.json'),
  require('./sql/users/helene.json')
]));

raw.push(knex('review').insert([
  require('./sql/agendas/metropole-europeenne-de-lille.json'),
  require('./sql/agendas/laPiscineRoubaix.json'),
  require('./sql/agendas/officedutourismeroubaix.json')
]));

raw.push(knex('reviewer').insert([
  require('./sql/members/tb-adm-mel.json'),
  require('./sql/members/ln-adm-rbx.json')
]));

raw.push(knex('location').insert([
  require('./sql/locations/laPiscine.json')
]));

raw.push(knex('network').insert([
  require('./sql/networks/mel.json'),
  require('./sql/networks/villeDeRoubaix.json')
]));

raw.push(knex('form_schema').insert([{
  id: 41,
  store: JSON.stringify(require('./form-schemas/41.json'))
}, {
  id: 374,
  store: JSON.stringify(require('./form-schemas/374.json'))
}]));

insertEventSet(knex, raw, 'saison-dexposition-de-lautomne-2020');

module.exports = raw.join(';\n') + ';';