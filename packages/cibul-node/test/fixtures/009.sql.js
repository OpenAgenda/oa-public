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

raw.push(knex('user').insert([
  load('sql/users/01.json'), // user id 1, uid 1
  load('sql/users/50300.json'), // new for test on custom
  load('sql/users/thibaud.json'),
  load('sql/users/lise.json'),
  load('sql/users/chrissie.json'),
  load('sql/users/helene.json'),
  load('sql/users/jean-benoit.json'),
  load('sql/users/steevie.json'),
]));

raw.push(knex('api_key_set').insert([
  load('sql/apiKeySets/01.json'), // user id 1
  load('sql/apiKeySets/lise.keys.json'),
  load('sql/apiKeySets/chrissie.keys.json'),
]));

const albiAgenda = require('./sql/agendas/albi.json'); // uid 48353388

raw.push(knex('review').insert([
  load('sql/agendas/01.json'), // uid 1
  load('sql/agendas/02.json'), // uid 2
  load('sql/agendas/03.json'), // uid 3 with custom member schema
  load('sql/agendas/albigeois.json'), // uid 93399464
  {
    ...albiAgenda,
    settings: '{"tracking":{"googleAnalytics":null},"lab":{"eventAdmin":true,"status":false},"inbox":{"mailto":{"enabled":false,"email":null,"subject":null,"body":null}},"contribution":{"type":1,"defaultState":2,"canPublish":["administrators","moderators"],"moderateOnChangeBy":[],"defaultLang":null,"allowLocationCreate":true,"messages":{"instructions":null,"complete":null,"publication":null},"useFields":false,"authorizedIPAddresses":[]},"translation":{"enabled":false,"source":"fr","sets":[],"service":"reverso","options":null}}',
  },
]));

raw.push(knex('network').insert([
  load('sql/networks/01.json'),
  load('sql/networks/albigeois.json'),
  load('sql/networks/albi.json'),
]));

raw.push(knex('form_schema').insert([
  {
    id: 1,
    store: JSON.stringify({ fields: [] }),
  },
  load('form-schemas/albigeois.network.json', fs => ({ id: 23483, store: JSON.stringify(fs) })),
  load('form-schemas/albigeois.agenda.json', fs => ({ id: 23481, store: JSON.stringify(fs) })),
  load('form-schemas/albi.network.json', fs => ({ id: 73, store: JSON.stringify(fs) })),
  load('form-schemas/albi.agenda.json', fs => ({ id: 10522, store: JSON.stringify(fs) })),
  load('form-schemas/memberFormSchema.json', fs => ({ id: 8, store: JSON.stringify(fs) })),
]));

raw.push(knex('reviewer').insert([
  load('sql/members/01.json'), // user id 1, user uid 1, agenda uid 2, contributor
  load('sql/members/02.json'), // user uid 1, agenda uid 3, moderator
  load('sql/members/03.json'), // uid 1, id 1, agenda uid 9, administrator
  load('sql/members/04.json'), // contributor agenda uid 11
  load('sql/members/05.json'), // uid 5, agenda uid 2, contributor
  load('sql/members/06.json'), // uid 67, agenda uid 2, contributor
  load('sql/members/07.json'),
  load('sql/members/08.json'),
  load('sql/members/09.json'), // uid 6887, agenda uid 3, contributor
  load('sql/members/lise.administrator.json'), // uid 50073466, agenda 2, admin
]));

raw.push(knex('custom').insert([
  load('sql/custom/01.json'), // id 1, identifier 6887,
]));

module.exports = `${raw.join(';\n')};`;
