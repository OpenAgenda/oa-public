'use strict';

const fs = require('fs');

const {
  knex,
  resetAndCreateTables,
} = require('./sql');

const raw = resetAndCreateTables();

raw.push(knex('user').insert([
  require('./sql/users/01.json'), // user id 1, uid 1
  require('./sql/users/50300.json'), // new for test on custom
  require('./sql/users/thibaud.json'),
  require('./sql/users/lise.json'),
  require('./sql/users/chrissie.json'),
  require('./sql/users/helene.json'),
  require('./sql/users/jean-benoit.json'),
  require('./sql/users/steevie.json'),
]));

raw.push(knex('api_key_set').insert([
  require('./sql/apiKeySets/01.json'), // user id 1
  require('./sql/apiKeySets/lise.keys.json'),
  require('./sql/apiKeySets/chrissie.keys.json'),
]));

const albiAgenda = require('./sql/agendas/albi.json'); // uid 48353388

raw.push(knex('review').insert([
  require('./sql/agendas/01.json'), // uid 1
  require('./sql/agendas/02.json'), // uid 2
  require('./sql/agendas/03.json'), // uid 3 with custom member schema
  require('./sql/agendas/albigeois.json'), // uid 93399464
  ({
    ...albiAgenda,
    settings: '{"tracking":{"googleAnalytics":null},"lab":{"eventAdmin":true,"status":false},"inbox":{"mailto":{"enabled":false,"email":null,"subject":null,"body":null}},"contribution":{"type":1,"defaultState":2,"canPublish":["administrators","moderators"],"moderateOnChangeBy":[],"defaultLang":null,"allowLocationCreate":true,"messages":{"instructions":null,"complete":null,"publication":null},"useFields":false,"authorizedIPAddresses":[]},"translation":{"enabled":false,"source":"fr","sets":[],"service":"reverso","options":null}}',
  }),
]));

raw.push(knex('network').insert([
  require('./sql/networks/01.json'),
  require('./sql/networks/albigeois.json'),
  require('./sql/networks/albi.json')
]));

raw.push(knex('form_schema').insert([{
  id: 1,
  store: JSON.stringify({ fields: [] }),
}, {
  id: 23483,
  store: fs.readFileSync(`${__dirname}/form-schemas/albigeois.network.json`),
}, {
  id: 23481,
  store: fs.readFileSync(`${__dirname}/form-schemas/albigeois.agenda.json`),
}, {
  id: 73,
  store: fs.readFileSync(`${__dirname}/form-schemas/albi.network.json`),
}, {
  id: 10522,
  store: fs.readFileSync(`${__dirname}/form-schemas/albi.agenda.json`),
}, {
  id: 8,
  store: fs.readFileSync(`${__dirname}/form-schemas/8.json`),
}]));

raw.push(knex('reviewer').insert([
  require('./sql/members/01.json'), // user id 1, user uid 1, agenda uid 2, contributor
  require('./sql/members/02.json'), // user uid 1, agenda uid 3, moderator
  require('./sql/members/03.json'), // uid 1, id 1, agenda uid 9, administrator
  require('./sql/members/04.json'), // contributor agenda uid 11
  require('./sql/members/05.json'), // uid 5, agenda uid 2, contributor
  require('./sql/members/06.json'), // uid 67, agenda uid 2, contributor
  require('./sql/members/07.json'),
  require('./sql/members/08.json'),
  require('./sql/members/09.json'), // uid 6887, agenda uid 3, contributor
  require('./sql/members/lise.administrator.json') // uid 50073466, agenda 2, admin
]));

raw.push(knex('custom').insert([
  require('./sql/custom/01.json'), // id 1, identifier 6887,
]));

module.exports = raw.join(';\n') + ';';
