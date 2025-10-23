import loadObjectFromFile from './loadObjectFromFile.js';
import { knex, resetAndCreateTables } from './sql/index.js';

const load = loadObjectFromFile({ cwd: import.meta.dirname });

const raw = resetAndCreateTables();

raw.push(
  knex('review').insert([
    load('sql/agendas/218.json', {
      indexed: 0,
    }),
    load('sql/agendas/219.json', {
      uid: 17026800,
      title: 'Le Fennec',
      slug: 'le-fennec',
      settings: JSON.stringify({}),
      location_set_uid: null,
    }),
    load('sql/agendas/220.json', {
      uid: 92983929,
      title: 'Un agenda avec un champ contributeur',
      slug: 'agenda-champ-contributeur',
      indexed: 1,
      network_uid: 1234,
      location_set_uid: 4321,
      settings: JSON.stringify({}),
      member_schema_id: 8,
      form_schema_id: 6,
    }),
    load('sql/agendas/221.json', {
      uid: 78971487,
      title: 'Un agenda privé',
      slug: 'agenda-prive',
      private: 1,
      settings: JSON.stringify({}),
    }),
    load('sql/agendas/laPiscineRoubaix.json', {
      uid: 12345,
      title: 'Un agenda configuré pour le pass',
      settings:
        '{"tracking":{"googleAnalytics":null,"matomoUrl":null,"matomoSiteId":null,"matomoCustom":[]},"lab":{"status":true},"inbox":{"mailto":{"enabled":false,"email":null,"subject":null,"body":null}},"contribution":{"type":1,"defaultState":2,"canPublish":["administrators","moderators"],"moderateOnChangeBy":[],"defaultLang":null,"allowLocationCreate":true,"messages":{"instructions":null,"complete":null,"publication":null,"GDPRInformation":null},"useFields":false,"authorizedIPAddresses":[]},"registration":{"passCulture":{"siren":["809346158"]}}}',
      network_uid: null,
    }),
  ]),
);

raw.push(
  knex('user').insert([
    load('./sql/users/50304.json'),
    load('./sql/users/50300.json'),
    load('./sql/users/helene.json', { uid: 789789 }),
  ]),
);

raw.push(
  knex('api_key_set').insert([
    load('./sql/apiKeySets/01.json', { user_id: 50304 }),
    load('./sql/apiKeySets/02.json'),
  ]),
);

raw.push(
  knex('reviewer').insert([
    load('./sql/members/71386687.json'),
    load('./sql/members/71386687.json', {
      id: 713866872,
      agenda_uid: 78971487,
      user_uid: 63170200,
    }),
    load('./sql/members/71386687.json', {
      id: 4845649789,
      agenda_uid: 12345,
      user_uid: 789789,
    }),
  ]),
);

raw.push(
  knex('network').insert([
    {
      id: 1,
      uid: 1234,
      title: 'Un réseau avec un champ admin',
      form_schema_id: 5,
      created_at: '2016-01-11 13:07:08',
      updated_at: '2016-01-18 16:14:06',
    },
  ]),
);

raw.push(
  knex('location_set').insert([
    {
      uid: 4321,
      title: 'Un jeu de lieux de test',
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]),
);

raw.push(
  knex('form_schema').insert(
    [2, 5, 6, { file: 'memberFormSchema', id: 8 }]
      .map((item) => (item instanceof Object ? item : { id: item, file: item }))
      .map(({ id, file }) => ({
        id,
        store: JSON.stringify(load(`./form-schemas/${file}.json`)),
      })),
  ),
);

export default `${raw.join(';\n')};`;
