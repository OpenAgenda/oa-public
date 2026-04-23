import loadObjectFromFile from './loadObjectFromFile.js';
import insertEventSet from './sql/eventSets/index.js';

const load = loadObjectFromFile({ cwd: import.meta.dirname });

export default async (knex) => {
  await knex('review').insert([
    load('sql/agendas/218.json', {
      settings: JSON.stringify({
        contribution: {
          type: 1,
          defaultState: 1,
        },
      }),
    }),
    load('sql/agendas/219.json', {
      uid: 17026800,
      settings: JSON.stringify({}),
    }),
    load('sql/agendas/220.json', {
      uid: 92983929,
      form_schema_id: 6,
      network_uid: 1234,
      settings: JSON.stringify({
        contribution: {
          moderateOnChangeBy: ['contributor'],
        },
      }),
    }),
    load('sql/agendas/221.json', {
      uid: 37026800,
      settings: JSON.stringify({
        contribution: {
          canPublish: ['administrators'],
        },
      }),
    }),
    load('sql/agendas/officedutourismeroubaix.json'),
    load('sql/agendas/metropole-europeenne-de-lille.json'),
    load('sql/agendas/ndm.json'),
    load('sql/agendas/private.json'),
    load('sql/agendas/unindexed.json'),
    {
      id: 222,
      uid: 55555555,
      slug: 'degesco-test-agenda',
      title: 'Degesco Test Agenda',
      description: 'Test agenda for degesco form schema',
      form_schema_id: 999,
      owner_id: 50304,
      official: 0,
      private: 0,
      credentials: '{}',
      settings: JSON.stringify({
        contribution: {
          type: 1,
          defaultState: 1,
        },
      }),
      created_at: '2016-01-11 13:07:08',
      updated_at: '2016-01-18 16:14:06',
    },
  ]);

  await knex('user').insert([
    load('sql/users/50304.json'),
    load('sql/users/helene.json'),
    load('sql/users/chrissie.json'),
    load('sql/users/thibaud.json'),
  ]);

  await knex('api_key_set').insert([
    load('sql/apiKeySets/01.json', { user_id: 50304 }),
  ]);

  await knex('network').insert([
    load('sql/networks/withadminfield.json'),
    load('sql/networks/mel.json'),
  ]);

  await knex('form_schema').insert(
    [2, 5, 6, 41]
      .map((id) =>
        load(`form-schemas/${id}.json`, (fs) => ({
          id,
          store: JSON.stringify(fs),
        })))
      .concat([
        load('form-schemas/374.json', (fs) => ({
          id: 374,
          store: JSON.stringify(fs),
        })),
        load('form-schemas/conditionalRegistration.schema.json', (fs) => ({
          id: 39147,
          store: JSON.stringify(fs),
        })),
        load('form-schemas/contribRestrictedField.json', (fs) => ({
          id: 999,
          store: JSON.stringify(fs),
        })),
      ]),
  );

  await knex('reviewer').insert([
    load('sql/members/lechat.json', {
      store: JSON.stringify({
        custom_fields: {
          organization: 'Le Chat Fume',
        },
      }),
    }),
    load('sql/members/ln-adm-rbx.json'),
    load('sql/members/chr-ctb-rbx.json'),
    load('sql/members/tb-adm-mel.json'),
    load('sql/members/ln-ctb-mel.json'),
    load('sql/members/tb-adm-mel.json', {
      id: 879456456,
      agenda_uid: 9491431,
    }),
    {
      id: 999001,
      user_uid: 10866730,
      agenda_uid: 55555555,
      credential: 2,
      created_at: '2017-10-30 14:21:07',
      updated_at: '2017-10-30 14:21:07',
      store: '{}',
      organization: 'degesco-admin',
      deleted_user: 0,
      actions_counter: 1,
    },
    {
      id: 999002,
      user_uid: 24372732,
      agenda_uid: 55555555,
      credential: 1,
      created_at: '2017-10-30 14:21:07',
      updated_at: '2017-10-30 14:21:07',
      store: '{}',
      organization: 'degesco-contributor',
      deleted_user: 0,
      actions_counter: 1,
    },
    {
      id: 999003,
      user_uid: 82253124,
      agenda_uid: 55555555,
      credential: 3,
      created_at: '2017-10-30 14:21:07',
      updated_at: '2017-10-30 14:21:07',
      store: '{}',
      organization: 'degesco-moderator',
      deleted_user: 0,
      actions_counter: 1,
    },
  ]);

  await knex('location').insert([
    load('sql/locations/boutique.json'),
    load('sql/locations/bobine.json'),
  ]);

  await knex('event_2').insert([
    {
      id: 12,
      uid: 19201989,
      slug: 'un-event',
      draft: 0,
      title: JSON.stringify({
        fr: 'Un événement',
        en: 'An event',
      }),
      owner_uid: 63170203,
      creator_uid: 63170203,
      timings: JSON.stringify([
        {
          begin: new Date('2019-05-06T10:00:00'),
          end: new Date('2019-05-06T11:00:00'),
        },
      ]),
      description: JSON.stringify({ fr: 'Une desc.', en: 'A desc.' }),
      timezone: 'Europe/Paris',
      location_uid: 123,
      created_at: new Date('2019-05-06T10:00:00'),
      updated_at: new Date('2019-05-06T10:00:00'),
      agenda_uid: 17026855,
    },
    {
      id: 13,
      uid: 83902931,
      draft: 1,
      slug: 'un-evenement-brouillon',
      owner_uid: 63170203,
      creator_uid: 63170203,
      title: JSON.stringify({
        fr: 'Un brouillon',
      }),
      agenda_uid: 17026855,
      description: JSON.stringify({}),
      timezone: 'Europe/Paris',
      created_at: new Date('2019-05-06T10:00:00'),
      updated_at: new Date('2019-05-06T10:00:00'),
    },
    {
      id: 14,
      uid: 19390293,
      slug: 'un-autre-event',
      image: JSON.stringify({
        filename: 'fdqfsdq.jpg',
      }),
      timings: JSON.stringify([
        {
          begin: new Date('2019-05-06T10:00:00'),
          end: new Date('2019-05-06T11:00:00'),
        },
      ]),
      draft: 0,
      owner_uid: 63170203,
      creator_uid: 63170203,
      title: JSON.stringify({
        fr: 'Un autre événement',
      }),
      description: JSON.stringify({ fr: 'Une description' }),
      timezone: 'Europe/Paris',
      location_uid: 123,
      agenda_uid: 92983929,
      created_at: new Date('2019-05-06T10:00:00'),
      updated_at: new Date('2019-05-06T10:00:00'),
    },
    {
      id: 15,
      uid: 19390294,
      slug: 'et-un-autre-event',
      draft: 0,
      owner_uid: 63170203,
      creator_uid: 63170203,
      title: JSON.stringify({
        fr: 'Un autre événement',
      }),
      timings: JSON.stringify([
        {
          begin: new Date('2023-05-06T10:00:00'),
          end: new Date('2023-05-06T11:00:00'),
        },
      ]),
      description: JSON.stringify({ fr: 'Une desc.' }),
      timezone: 'Europe/Paris',
      location_uid: 123,
      agenda_uid: 92983929,
      created_at: new Date('2019-05-06T10:00:00'),
      updated_at: new Date('2019-05-06T10:00:00'),
    },
    {
      id: 16,
      uid: 83902932,
      draft: 1,
      slug: 'un-autre-evenement-brouillon',
      owner_uid: 63170203,
      creator_uid: 63170203,
      title: JSON.stringify({
        fr: 'Un autre brouillon',
      }),
      agenda_uid: 17026855,
      description: JSON.stringify({ fr: 'Une desc.' }),
      timezone: 'Europe/Paris',
      created_at: new Date('2019-05-06T10:00:00'),
      updated_at: new Date('2019-05-06T10:00:00'),
    },
    {
      id: 17,
      uid: 99999999,
      draft: 0,
      slug: 'un-evenement-can-cannot-edit',
      owner_uid: 63170203,
      creator_uid: 63170203,
      title: JSON.stringify({
        fr: 'Un autre événement',
      }),
      timings: JSON.stringify([
        {
          begin: new Date('2019-05-06T10:00:00'),
          end: new Date('2019-05-06T11:00:00'),
        },
      ]),
      location_uid: 123,
      description: JSON.stringify({ fr: 'Une desc.' }),
      timezone: 'Europe/Paris',
      created_at: new Date('2019-05-06T10:00:00'),
      updated_at: new Date('2019-05-06T10:00:00'),
    },
    {
      id: 18,
      uid: 88888888,
      draft: 0,
      slug: 'un-evenement-sur-un-agenda-qui-ne-laisse-pas-mod-publish',
      owner_uid: 63170203,
      creator_uid: 63170203,
      agenda_uid: 17026855,
      title: JSON.stringify({
        fr: 'Encore un autre événement',
      }),
      timings: JSON.stringify([
        {
          begin: new Date('2019-05-06T10:00:00'),
          end: new Date('2019-05-06T11:00:00'),
        },
      ]),
      location_uid: 123,
      links: '[]',
      description: JSON.stringify({ fr: 'Une desc.' }),
      timezone: 'Europe/Paris',
      created_at: new Date('2019-05-06T10:00:00'),
      updated_at: new Date('2019-05-06T10:00:00'),
    },
    load('events/des-oeuvres-et-vous.json'),
    load('events/incomplete.json'),
    load('events/private.json'),
    load('events/proposition-de-spectacle.json'),
    load('events/spectacle-accepte.json'),
    load('events/spectacle-plus-acceptable.json'),
    load('events/invalid-additional-fields.json'),
    {
      id: 19,
      uid: 77777777,
      draft: 0,
      slug: 'degesco-event-1',
      owner_uid: 24372732,
      creator_uid: 24372732,
      agenda_uid: 55555555,
      title: JSON.stringify({
        fr: 'Événement Degesco 1',
      }),
      timings: JSON.stringify([
        {
          begin: new Date('2025-05-06T10:00:00'),
          end: new Date('2025-05-06T11:00:00'),
        },
      ]),
      location_uid: 123,
      description: JSON.stringify({
        fr: 'Description du premier événement degesco',
      }),
      timezone: 'Europe/Paris',
      created_at: new Date('2019-05-06T10:00:00'),
      updated_at: new Date('2019-05-06T10:00:00'),
    },
    {
      id: 20,
      uid: 77777778,
      draft: 0,
      slug: 'degesco-event-2',
      owner_uid: 10866730,
      creator_uid: 10866730,
      agenda_uid: 55555555,
      title: JSON.stringify({
        fr: 'Événement Degesco 2',
      }),
      timings: JSON.stringify([
        {
          begin: new Date('2025-06-15T14:00:00'),
          end: new Date('2025-06-15T16:00:00'),
        },
      ]),
      location_uid: 123,
      description: JSON.stringify({
        fr: 'Description du deuxième événement degesco',
      }),
      timezone: 'Europe/Paris',
      created_at: new Date('2019-05-06T10:00:00'),
      updated_at: new Date('2019-05-06T10:00:00'),
    },
    {
      id: 21,
      uid: 9876543,
      draft: 0,
      slug: 'ghost-event-1',
      owner_uid: 10866730,
      creator_uid: 10866730,
      agenda_uid: 89904399,
      title: JSON.stringify({
        fr: 'Événement Fantôme',
      }),
      timings: JSON.stringify([
        {
          begin: new Date('2026-06-15T14:00:00'),
          end: new Date('2026-06-15T16:00:00'),
        },
      ]),
      location_uid: 123,
      description: JSON.stringify({
        fr: "Un événement qui n'est plus dans l'agenda mais toujours dans l'index",
      }),
      timezone: 'Europe/Paris',
      created_at: new Date('2019-05-06T10:00:00'),
      updated_at: new Date('2019-05-06T10:00:00'),
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
      event_uid: 19390293,
      agenda_uid: 92983929,
      user_uid: 63170203,
      state: 2,
      created_at: new Date('2019-05-06T10:00:00'),
      updated_at: new Date('2019-05-06T10:00:00'),
      can_edit: 1,
    },
    {
      id: 3,
      event_uid: 19390294,
      agenda_uid: 92983929,
      user_uid: 63170203,
      state: 2,
      created_at: new Date('2019-05-06T10:00:00'),
      updated_at: new Date('2019-05-06T10:00:00'),
      can_edit: 1,
    },
    {
      id: 4,
      event_uid: 99999999,
      agenda_uid: 17026855,
      can_edit: 1,
      user_uid: 63170203,
      state: 2,
      created_at: new Date('2019-05-06T10:00:00'),
      updated_at: new Date('2019-05-06T10:00:00'),
    },
    {
      id: 5,
      event_uid: 99999999,
      agenda_uid: 92983929,
      can_edit: 0,
      user_uid: 63170203,
      state: 2,
      created_at: new Date('2019-05-06T10:00:00'),
      updated_at: new Date('2019-05-06T10:00:00'),
    },
    {
      id: 6,
      event_uid: 19390293,
      agenda_uid: 17026855,
      user_uid: 63170203,
      state: 2,
      created_at: new Date('2019-05-06T10:00:00'),
      updated_at: new Date('2019-05-06T10:00:00'),
      can_edit: 1,
    },
    {
      id: 7,
      event_uid: 88888888,
      agenda_uid: 37026800,
      can_edit: 1,
      user_uid: 63170203,
      state: 1,
      created_at: new Date('2019-05-06T10:00:00'),
      updated_at: new Date('2019-05-06T10:00:00'),
    },
    {
      id: 8,
      event_uid: 88888888,
      agenda_uid: 17026855,
      user_uid: 63170203,
      state: 0,
      can_edit: 0,
      created_at: new Date('2024-08-07T10:00:00'),
      updated_at: new Date('2024-08-07T10:00:00'),
    },
    load('events/des-oeuvres-et-vous.ae.json'),
    load('events/incomplete.ae.json'),
    load('events/private.ae.json'),
    load('events/proposition-de-spectacle.ae.json'),
    load('events/spectacle-accepte.ae.json'),
    load('events/spectacle-accepte.ae2.json'),
    load('events/spectacle-plus-acceptable.ae.json'),
    load('events/spectacle-plus-acceptable.ae2.json'),
    load('events/invalid-additional-fields.ae.json'),
    {
      id: 9,
      event_uid: 77777777,
      agenda_uid: 55555555,
      user_uid: 24372732,
      state: 1,
      created_at: new Date('2019-05-06T10:00:00'),
      updated_at: new Date('2019-05-06T10:00:00'),
      can_edit: 1,
    },
    {
      id: 10,
      event_uid: 77777778,
      agenda_uid: 55555555,
      user_uid: 10866730,
      state: 1,
      created_at: new Date('2019-05-06T10:00:00'),
      updated_at: new Date('2019-05-06T10:00:00'),
      can_edit: 1,
    },
    {
      id: 11,
      event_uid: 9876543,
      agenda_uid: 89904399,
      state: 2,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);

  await knex('custom').insert([
    {
      id: 1,
      form_schema_id: 5,
      identifier: 19390293,
      store: JSON.stringify({
        'organisation-interne': 'Il faut que Thérèse y soit',
      }),
      created_at: '2016-01-11 13:07:08',
      updated_at: '2016-01-18 16:14:06',
    },
    {
      id: 2,
      form_schema_id: 6,
      identifier: 19390293,
      store: JSON.stringify({
        categories: 1,
      }),
      created_at: '2016-01-11 13:07:08',
      updated_at: '2016-01-18 16:14:06',
    },
    {
      id: 3,
      form_schema_id: 5,
      identifier: 19390294,
      store: JSON.stringify({
        'organisation-interne': 'Il faut que Thérèse y soit',
      }),
      created_at: '2016-01-11 13:07:08',
      updated_at: '2016-01-18 16:14:06',
    },
    {
      id: 4,
      form_schema_id: 6,
      identifier: 19390294,
      store: JSON.stringify({
        categories: 2,
      }),
      created_at: '2016-01-11 13:07:08',
      updated_at: '2016-01-18 16:14:06',
    },
    {
      id: 5,
      form_schema_id: 39147,
      identifier: 12993375,
      store: JSON.stringify({
        'types-devenement': 9,
        'jaccepte-que-limage-puisse-etre-librement-utilisee-a-la-condition': true,
        'conditions-de-participation': [13],
        'type-de-public': 80,
      }),
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 6,
      form_schema_id: 2,
      identifier: 19390293,
      store: JSON.stringify({
        'categories-agenda-metropolitain': 42,
      }),
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 7,
      form_schema_id: 374,
      identifier: 3969008,
      store: JSON.stringify({
        'categories-metropolitaines': 101,
      }),
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 8,
      form_schema_id: 41,
      identifier: 3969008,
      store: JSON.stringify({
        'categories-metropolitaines': 8,
      }),
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 9,
      form_schema_id: 999,
      identifier: 77777777,
      store: JSON.stringify({
        contributorOnlyField: 'initial value',
      }),
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 10,
      form_schema_id: 999,
      identifier: 77777778,
      store: JSON.stringify({
        contributorOnlyField: 'initial value',
      }),
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 12,
      form_schema_id: 2,
      identifier: 19201989,
      store: JSON.stringify({
        'categories-agenda-metropolitain': 42,
      }),
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 13,
      form_schema_id: 6,
      identifier: 99999999,
      store: JSON.stringify({
        categories: 1,
      }),
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 14,
      form_schema_id: 5,
      identifier: 99999999,
      store: JSON.stringify({
        'organisation-interne': 'Il faut que Thérèse y soit',
      }),
      created_at: '2016-01-11 13:07:08',
      updated_at: '2016-01-18 16:14:06',
    },
  ]);

  await insertEventSet(knex, 'lesUnsLesAutres');
};
