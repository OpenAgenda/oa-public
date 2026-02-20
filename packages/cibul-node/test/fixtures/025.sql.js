import loadObjectFromFile from './loadObjectFromFile.js';
import { knex, resetAndCreateTables } from './sql/index.js';

const load = loadObjectFromFile({ cwd: import.meta.dirname });

const raw = resetAndCreateTables();

raw.push(
  knex('review').insert([
    load('sql/agendas/01.json', {
      network_uid: null,
      form_schema_id: 1,
    }),
    {
      id: 3,
      uid: 3,
      title: 'Test Agenda 3',
      description: 'Agenda for testing contributor access bug',
      slug: 'test-agenda-3',
      owner_id: 1,
      official: 0,
      form_schema_id: 1,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]),
);

raw.push(
  knex('user').insert([
    load('sql/users/01.json'), // user 1, uid 1 - creator
    load('sql/users/50300.json'), // user 2, uid 82253124 - other contributor
  ]),
);

raw.push(
  knex('api_key_set').insert([
    load('sql/apiKeySets/01.json'), // for user 1
    load('sql/apiKeySets/50300.json', {
      id: 2,
      api_key: 'egP36aMb0toI8hAhFOm1if8auC1Vg1N0',
      api_secret: 'N0ty3poxNSTt5KTzxPJHUG6896UseQhN',
    }), // for user 2
  ]),
);

raw.push(
  knex('form_schema').insert([
    {
      id: 1,
      store: JSON.stringify({
        fields: [],
      }),
    },
  ]),
);

raw.push(
  knex('reviewer').insert([
    load('sql/members/01.json'), // user 1: contributor on agenda 2
    {
      id: 2,
      user_uid: 1,
      agenda_uid: 3,
      credential: 1,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_user: 0,
      actions_counter: 0,
      store: '{}',
    },
    {
      id: 3,
      user_uid: 82253124,
      agenda_uid: 3,
      credential: 1,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_user: 0,
      actions_counter: 0,
      store: '{}',
    },
  ]),
);

raw.push(knex('location').insert([load('sql/locations/1.json')]));

raw.push(
  knex('event_2').insert([
    {
      id: 1,
      owner_uid: 1,
      creator_uid: 1,
      agenda_uid: 1,
      slug: 'event-contributor-access-test',
      uid: 1,
      draft: 0,
      title: JSON.stringify({
        fr: 'Evénement pour test accès contributeur',
      }),
      description: JSON.stringify({
        fr: "Cet événement teste le bug d'accès contributeur selon le state",
      }),
      timings: JSON.stringify([
        {
          begin: new Date('2019-09-28T14:00:00+0200'),
          end: new Date('2019-09-28T18:00:00+0200'),
        },
      ]),
      location_uid: 123,
      timezone: 'Europe/Paris',
      created_at: new Date('2022-07-01T10:00:00.000Z'),
      updated_at: new Date('2022-07-01T10:00:00.000Z'),
    },
  ]),
);

raw.push(
  knex('agenda_event').insert([
    {
      id: 1,
      user_uid: 1,
      agenda_uid: 1,
      event_uid: 1,
      state: 2,
      created_at: new Date('2022-07-01T10:00:00.000Z'),
      updated_at: new Date('2022-07-01T10:00:00.000Z'),
    },
    {
      id: 2,
      user_uid: 1,
      agenda_uid: 3,
      event_uid: 1,
      state: 0,
      created_at: new Date('2022-07-01T10:00:00.000Z'),
      updated_at: new Date('2022-07-01T10:00:00.000Z'),
    },
  ]),
);

export default `${raw.join(';\n')};`;
