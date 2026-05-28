import load from './loadObjectFromFile.js';
import seedApiKeys from './seedApiKeys.js';

export default async (knex) => {
  await knex('user').insert([
    load('sql/users/thibaud.json', {
      id: 1,
      uid: 1,
    }),
    load('sql/users/helene.json', {
      id: 2,
      uid: 2,
    }),
  ]);

  await seedApiKeys(knex, [
    // thibaud (admin), userUid 1
    { plaintext: 'egP36aMb0toI8hAhFOm1if8auC1Vg1N9', oaKind: 'pk', userUid: 1 },
    { plaintext: 'N0ty3poxNSTt5KTzxPJHUG6896UseQhL', oaKind: 'sk', userUid: 1 },
    // helene (contributor), userUid 2
    { plaintext: '0toI8hA1if8auC1hFOmegP36aMbVg1N9', oaKind: 'pk', userUid: 2 },
    { plaintext: 'N0ty3poxNSTt5KTzxPJHUG6896UseQhM', oaKind: 'sk', userUid: 2 },
  ]);

  await knex('access_token').insert([
    {
      id: 1,
      token: '11a79182cddd2466c768867ac3f25ba0',
      lifespan: 100000000, // long lifespan for testing
      user_id: 1,
      created_at: new Date('2019-01-01T00:00:00'),
      updated_at: new Date('2019-01-01T00:00:00'),
    },
    {
      id: 2,
      token: '11a7946ddd256c768867ac3f2182cba0',
      lifespan: 100000000, // long lifespan for testing
      user_id: 2,
      created_at: new Date('2019-01-01T00:00:00'),
      updated_at: new Date('2019-01-01T00:00:00'),
    },
  ]);

  await knex('review').insert([
    load('sql/agendas/metropole-europeenne-de-lille.json', {
      uid: 1234,
    }),
    load('sql/agendas/laPiscineRoubaix.json'),
    load('sql/agendas/officedutourismeroubaix.json'),
  ]);

  await knex('reviewer').insert([
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
  ]);

  await knex('location').insert([
    load('sql/locations/laPiscine.json', {
      agenda_id: 1234,
      ext_ids: '{"identifiers": ["default->laPiscine"]}',
    }),
    load('sql/locations/laBaignoire.json', {
      agenda_id: 1234,
      ext_ids: '{"identifiers": ["default->laBaignoire"]}',
    }),
  ]);

  await knex('network').insert([
    load('sql/networks/mel.json'),
    load('sql/networks/villeDeRoubaix.json'),
  ]);
};
