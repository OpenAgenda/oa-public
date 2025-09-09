import loadObjectFromFile from './loadObjectFromFile.js';
import { knex, resetAndCreateTables } from './sql/index.js';

const load = loadObjectFromFile({ cwd: import.meta.dirname });

const raw = resetAndCreateTables();

raw.push(
  knex('inboxes_inbox').insert([
    {
      id: 2,
      type: 'agenda',
      identifier: 1001,
    },
    {
      id: 3,
      type: 'user',
      identifier: 1,
    },
  ]),
);

raw.push(
  knex('inboxes_inbox_user').insert([
    {
      id: 1,
      inbox_id: 2,
      user_uid: 2,
      left_at: null,
    },
    {
      id: 2,
      inbox_id: 2,
      user_uid: 1,
      left_at: null,
    },
  ]),
);

raw.push(
  knex('user').insert([
    load('sql/users/thibaud.json', {
      id: 1,
      uid: 1,
    }),
    load('sql/users/helene.json', {
      id: 2,
      uid: 2,
    }),
  ]),
);

raw.push(
  knex('review').insert([
    load('sql/agendas/01.json', {
      uid: 1001,
    }),
  ]),
);

raw.push(
  knex('reviewer').insert([
    {
      id: 1,
      user_id: 1,
      review_id: 1001,
      user_uid: 1,
      agenda_uid: 1001,
      credential: 2, // administrator
      created_at: new Date('2017-10-30T14:21:07'),
      updated_at: new Date('2017-10-30T14:21:07'),
      store: '{}',
      organization: null,
      deleted_user: 0,
      actions_counter: 1,
    },
    {
      id: 2,
      user_id: 2,
      review_id: 1001,
      user_uid: 2,
      agenda_uid: 1001,
      credential: 1, // contributor
      created_at: new Date('2017-10-30T14:21:07'),
      updated_at: new Date('2017-10-30T14:21:07'),
      store: '{}',
      organization: null,
      deleted_user: 0,
      actions_counter: 1,
    },
  ]),
);

raw.push(
  knex('event_2').insert([
    {
      id: 1,
      owner_uid: 1,
      agenda_uid: 1001,
      creator_uid: 1,
      slug: 'event-1',
      uid: 1,
      draft: 0,
      title: JSON.stringify({
        fr: 'Evénement 1',
      }),
      description: JSON.stringify({
        fr: 'Description 1',
      }),
      long_description: JSON.stringify({
        fr: 'Description longue 1',
      }),
      timings: JSON.stringify([
        {
          begin: new Date('2019-09-27T10:00:00+0200'),
          end: new Date('2019-09-27T12:00:00+0200'),
        },
      ]),
      location_uid: 1,
      timezone: 'Europe/Paris',
      created_at: new Date('2022-06-01T14:00:00.000Z'),
      updated_at: new Date('2022-06-10T09:00:00.000Z'),
      file_key: '31a7df7098744844b6c6ce0d2cdba0f4',
    },
  ]),
);

raw.push(
  knex('agenda_event').insert([
    {
      id: 1,
      user_uid: 2, // Changed from 1 to 2 so admin (uid: 1) can create conversation with contributor (uid: 2)
      agenda_uid: 1001,
      event_uid: 1,
      state: 2,
      created_at: new Date(),
      updated_at: new Date('2022-06-22T09:00:00.000Z'),
    },
  ]),
);

// Add API key sets for the test users
raw.push(
  knex('api_key_set').insert([
    {
      id: 1,
      api_key: 'egP36aMb0toI8hAhFOm1if8auC1Vg1N9',
      api_secret: 'N0ty3poxNSTt5KTzxPJHUG6896UseQhL', // admin code
      type: 1,
      user_id: 1, // thibaud (admin)
      created_at: new Date('2019-12-22T18:14:00'),
      updated_at: new Date('2019-12-22T18:14:00'),
    },
    {
      id: 2,
      api_key: '0toI8hA1if8auC1hFOmegP36aMbVg1N9',
      api_secret: 'N0ty3poxNSTt5KTzxPJHUG6896UseQhM', // contributor code
      type: 1,
      user_id: 2, // helene (contributor)
      created_at: new Date('2019-12-22T18:14:00'),
      updated_at: new Date('2019-12-22T18:14:00'),
    },
  ]),
);

// Add access tokens
raw.push(
  knex('access_token').insert([
    {
      id: 1,
      token: '11a79182cddd2466c768867ac3f25ba0',
      lifespan: 100000000, // long lifespan for testing
      api_key_set_id: 1,
      created_at: new Date('2019-01-01T00:00:00'),
      updated_at: new Date('2019-01-01T00:00:00'),
    },
    {
      id: 2,
      token: '11a7946ddd256c768867ac3f2182cba0',
      lifespan: 100000000, // long lifespan for testing
      api_key_set_id: 2,
      created_at: new Date('2019-01-01T00:00:00'),
      updated_at: new Date('2019-01-01T00:00:00'),
    },
  ]),
);

export default `${raw.join(';\n')};`;
