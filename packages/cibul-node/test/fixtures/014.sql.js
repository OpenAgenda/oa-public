'use strict';

const fs = require('fs');

const {
  knex,
  resetAndCreateTables
} = require('./sql');

const insertEventSet = require('./sql/eventSets');

const raw = resetAndCreateTables();

raw.push(knex('user').insert([
  require('./sql/users/janine.json'),
  require('./sql/users/lise.json'),
  require('./sql/users/margaux.json')
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
  require('./sql/agendas/219.json'),
  require('./sql/agendas/arles.json'),
  require('./sql/agendas/albi.json'),
  require('./sql/agendas/albigeois.json')
]));

raw.push(knex('reviewer').insert([
  require('./sql/members/71385.json'),
  require('./sql/members/71386.json'),
  require('./sql/members/71387.json'),
  require('./sql/members/71388.json'),
  require('./sql/members/janine.admin.albigeois.json'),
  require('./sql/members/lise.contributor.albi.json'),
  require('./sql/members/margaux.administrator.albi.json')
]));

raw.push(knex('location_set').insert([
  require('./sql/locations/set.json')
]));

raw.push(knex('location').insert([
  require('./sql/locations/1.json'),
  require('./sql/locations/2.json'),
  require('./sql/locations/3.json'), // eventSet 3 (removed by core test)
  require('./sql/locations/4.json'),
  require('./sql/locations/5.json'),
  require('./sql/locations/6.json'),
  require('./sql/locations/7.json'), // eventSet 7 (removed by api test)
  require('./sql/locations/8.json'), // eventSet 4 (removed by api test)
  require('./sql/locations/9.json'), // eventSet 5
  require('./sql/locations/chezVous.json'),
  require('./sql/locations/museeToulouseLautrec.json')
]));

raw.push(knex('network').insert([
  require('./sql/networks/albi.json'),
  require('./sql/networks/albigeois.json')
]));

insertEventSet(knex, raw, 3);
insertEventSet(knex, raw, 4);
insertEventSet(knex, raw, 5);
insertEventSet(knex, raw, 7);
insertEventSet(knex, raw, 'videoReportage');
insertEventSet(knex, raw, 'toulouseLautrec');

raw.push(knex('form_schema').insert([{
  id: 2,
  store: fs.readFileSync(`${__dirname}/form-schemas/1.json`)
}, {
  id: 3,
  store: JSON.stringify({
    fields: [],
    nextOptionId: 1
  })
}, {
  id: 23483,
  store: fs.readFileSync(`${__dirname}/form-schemas/albigeois.network.json`)
}, {
  id: 73,
  store: fs.readFileSync(`${__dirname}/form-schemas/albi.network.json`)
}, {
  id: 10522,
  store: fs.readFileSync(`${__dirname}/form-schemas/albi.agenda.json`)
}, {
  id: 23481,
  store: fs.readFileSync(`${__dirname}/form-schemas/albigeois.agenda.json`)
}]));

module.exports = `${raw.join(';\n')};`;
