import loadObjectFromFile from './loadObjectFromFile.js';

const load = loadObjectFromFile({ cwd: import.meta.dirname });

export default async (knex) => {
  await knex('review').insert([
    load('sql/agendas/218.json'),
    load('sql/agendas/219.json'),
    load('sql/agendas/221.json'),
  ]);

  await knex('user').insert([
    load('sql/users/50304.json'),
    load('sql/users/thibaud.json'),
  ]);

  await knex('api_key_set').insert([
    load('sql/apiKeySets/01.json', { user_id: 50304 }),
    load('sql/apiKeySets/02.json', { user_id: 63460 }),
  ]);

  await knex('form_schema').insert([
    load('form-schemas/2.json', (fs) => ({ id: 2, store: JSON.stringify(fs) })),
    load('form-schemas/4.json', (fs) => ({ id: 4, store: JSON.stringify(fs) })),
  ]);

  await knex('reviewer').insert([
    load('sql/members/71385.json'),
    load('sql/members/71386.json'),
  ]);

  await knex('location').insert([
    {
      id: 1,
      uid: 123,
      agenda_id: 218,
      slug: 'la-boutique',
      placename: 'La boutique',
      address: '29 passage du Ponceau, Paris',
      city: 'Paris',
      country: 'FR',
      latitude: 48.867688,
      longitude: 2.351739,
      store: JSON.stringify({
        extId: 'fdsqfdsq',
      }),
      created_at: '2016-01-11 13:07:08',
      updated_at: '2016-01-18 16:14:06',
    },
  ]);

  await knex('event_2').insert([
    {
      id: 12,
      uid: 19201989,
      slug: 'un-event',
      title: JSON.stringify({
        fr: 'Un event',
      }),
      description: JSON.stringify({
        fr: 'Une desc',
      }),
      draft: 0,
      timezone: 'Europe/Paris',
      owner_uid: 63170203,
      creator_uid: 63170203,
      timings: JSON.stringify([
        {
          begin: new Date('2019-05-06T10:00:00'),
          end: new Date('2019-05-06T11:00:00'),
        },
      ]),
      location_uid: 123,
      agenda_uid: 17026855,
      created_at: new Date('2019-05-06T10:00:00'),
      updated_at: new Date('2019-05-06T10:00:00'),
    },
    {
      id: 13,
      uid: 19201978,
      slug: 'un-autre-event',
      owner_uid: 63170203,
      creator_uid: 63170203,
      title: JSON.stringify({
        fr: 'Un autre event',
      }),
      description: JSON.stringify({
        fr: 'Une desc',
      }),
      draft: 0,
      timezone: 'Europe/Paris',
      timings: JSON.stringify([
        {
          begin: new Date('2019-05-08T10:00:00'),
          end: new Date('2019-05-08T11:00:00'),
        },
      ]),
      location_uid: 123,
      agenda_uid: 17026855,
      created_at: new Date('2019-05-06T10:00:00'),
      updated_at: new Date('2019-05-06T10:00:00'),
    },
    {
      id: 14,
      uid: 89378913,
      slug: 'un-event-brouillon',
      owner_uid: 63170203,
      creator_uid: 63170203,
      title: JSON.stringify({
        fr: 'Un event brouillon',
      }),
      description: JSON.stringify({
        fr: 'Une desc',
      }),
      draft: 1,
      timezone: 'Europe/Paris',
      timings: JSON.stringify([
        {
          begin: new Date('2019-05-08T10:00:00'),
          end: new Date('2019-05-08T11:00:00'),
        },
      ]),
      location_uid: 123,
      agenda_uid: 17026855,
      created_at: new Date('2019-05-06T10:00:00'),
      updated_at: new Date('2019-05-06T10:00:00'),
    },
    {
      id: 15,
      uid: 90298390,
      slug: 'encore-un-autre-event',
      owner_uid: 63170203,
      creator_uid: 63170203,
      title: JSON.stringify({
        fr: 'Encore un autre event',
      }),
      description: JSON.stringify({
        fr: 'Une desc',
      }),
      draft: 0,
      timezone: 'Europe/Paris',
      timings: JSON.stringify([
        {
          begin: new Date('2020-02-18T10:00:00'),
          end: new Date('2020-02-18T18:00:00'),
        },
      ]),
      location_uid: 123,
      agenda_uid: 17026855,
      created_at: new Date('2020-02-18T10:00:00'),
      updated_at: new Date('2020-02-18T10:00:00'),
    },
    {
      id: 16,
      uid: 789456,
      slug: 'un-event-qui-ne-doit-pas-etre-supprime',
      owner_uid: 63170203,
      creator_uid: 63170203,
      title: JSON.stringify({
        fr: 'Cet événement ne sera pas supprimé',
      }),
      description: JSON.stringify({
        fr: 'Une desc',
      }),
      draft: 0,
      timezone: 'Europe/Paris',
      timings: JSON.stringify([
        {
          begin: new Date('2020-02-18T10:00:00'),
          end: new Date('2020-02-18T18:00:00'),
        },
      ]),
      location_uid: 123,
      agenda_uid: 17026855,
      created_at: new Date('2020-02-18T10:00:00'),
      updated_at: new Date('2020-02-18T10:00:00'),
    },
  ]);

  await knex('agenda_event').insert([
    {
      id: 1,
      event_uid: 19201989,
      agenda_uid: 17026855,
      user_uid: 63170203,
      state: 2,
      created_at: new Date('2019-05-06T10:00:00'),
      updated_at: new Date('2019-05-06T10:00:00'),
      can_edit: 1,
    },
    {
      id: 2,
      event_uid: 19201989,
      agenda_uid: 17026800,
      user_uid: 63170203,
      state: 2,
      created_at: new Date('2019-05-06T10:00:00'),
      updated_at: new Date('2019-05-06T10:00:00'),
    },
    {
      id: 3,
      event_uid: 19201978,
      agenda_uid: 17026855,
      user_uid: 63170203,
      state: 2,
      created_at: new Date('2019-05-06T10:00:00'),
      updated_at: new Date('2019-05-06T10:00:00'),
      can_edit: 1,
    },
    {
      id: 4,
      event_uid: 19201978,
      agenda_uid: 17026800,
      user_uid: 63170203,
      state: 2,
      created_at: new Date('2019-05-06T10:00:00'),
      updated_at: new Date('2019-05-06T10:00:00'),
    },
    {
      id: 5,
      event_uid: 90298390,
      agenda_uid: 17026855,
      user_uid: 63170203,
      state: 2,
      created_at: new Date('2020-02-18T10:00:00'),
      updated_at: new Date('2020-02-18T10:00:00'),
      can_edit: 1,
    },
    {
      event_uid: 789456,
      agenda_uid: 17026855,
      user_uid: 63170203,
      state: 2,
      created_at: new Date('2024-08-22T10:00:00'),
      updated_at: new Date('2024-08-22T10:00:00'),
      can_edit: 1,
    },
  ]);

  await knex('custom').insert([
    {
      id: 9090,
      form_schema_id: 2,
      identifier: 19201989,
      store: JSON.stringify({
        'categories-agenda-metropolitain': 46,
      }),
      created_at: new Date('2019-05-06T10:00:00'),
      updated_at: new Date('2019-05-06T10:00:00'),
    },
    {
      id: 9091,
      form_schema_id: 4,
      identifier: 19201989,
      store: JSON.stringify({
        'thematiques-metropolitaines': [3],
      }),
      created_at: new Date('2019-05-06T10:00:00'),
      updated_at: new Date('2019-05-06T10:00:00'),
    },
  ]);
};
