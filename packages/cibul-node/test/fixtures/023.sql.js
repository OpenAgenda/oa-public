import loadObjectFromFile from './loadObjectFromFile.js';
import { knex } from './sql/index.js';

const load = loadObjectFromFile({ cwd: import.meta.dirname });

const raw = [];

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

raw.push(
  knex('review').insert([
    load('sql/agendas/metropole-europeenne-de-lille.json', {
      uid: 1234,
    }),
    load('sql/agendas/laPiscineRoubaix.json'),
    load('sql/agendas/officedutourismeroubaix.json'),
  ]),
);

raw.push(
  knex('reviewer').insert([
    {
      id: 1,
      user_uid: 1,
      agenda_uid: 1234,
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
      user_uid: 2,
      agenda_uid: 1234,
      credential: 1, // contributor
      created_at: new Date('2017-10-30T14:21:07'),
      updated_at: new Date('2017-10-30T14:21:07'),
      store: '{}',
      organization: null,
      deleted_user: 0,
      actions_counter: 1,
    },
    load('sql/members/ln-adm-rbx.json'),
  ]),
);

raw.push(
  knex('location').insert([
    load('sql/locations/laPiscine.json', {
      agenda_id: 1234,
      ext_ids: '{"identifiers": ["default->laPiscine"]}',
    }),
    load('sql/locations/laBaignoire.json', {
      agenda_id: 1234,
      ext_ids: '{"identifiers": ["default->laBaignoire"]}',
    }),
  ]),
);

raw.push(
  knex('network').insert([
    load('sql/networks/mel.json'),
    load('sql/networks/villeDeRoubaix.json'),
  ]),
);

export default `${raw.join(';\n')};`;
