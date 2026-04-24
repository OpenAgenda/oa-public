import fs from 'node:fs';
import insertEventSet from './sql/eventSets/index.js';

export default async (knex) => {
  await knex('user').insert([
    {
      id: 50304,
      uid: 63170203,
      full_name: 'steve',
      email: 'steve@oa.com',
      password: 'a3bcf2ede1e72cf6123d1226d5d079bf03b68d65',
      salt: '6OLumvJLubAklsDhuJJiuVQJTAX8MfF3',
      created_at: '2017-11-15 15:50:11',
      updated_at: '2017-11-15 15:50:30',
    },
  ]);

  await knex('review').insert([
    {
      id: 218,
      uid: 17026855,
      title: 'La Gargouille',
      slug: 'la-gargouille',
      description: 'Une petite description',
      owner_id: 50304,
      created_at: '2016-01-11 13:07:08',
      updated_at: '2016-01-18 16:14:06',
      official: 0,
      private: 0,
      credentials: '{}',
      form_schema_id: 2,
      settings: JSON.stringify({
        contribution: {
          type: 1,
        },
      }),
    },
    {
      id: 219,
      uid: 17026800,
      title: 'Le Fennec',
      slug: 'le-fennec',
      description: 'Une petite description',
      owner_id: 50304,
      created_at: '2016-01-11 13:07:08',
      updated_at: '2016-01-18 16:14:06',
      official: 0,
      credentials: '{}',
      form_schema_id: 4,
      settings: JSON.stringify({
        contribution: {
          defaultState: 0,
        },
      }),
    },
  ]);

  await knex('form_schema').insert([
    {
      id: 2,
      store: fs.readFileSync(`${import.meta.dirname}/form-schemas/2.json`),
    },
    {
      id: 4,
      store: fs.readFileSync(`${import.meta.dirname}/form-schemas/4.json`),
    },
  ]);

  await knex('reviewer').insert([
    {
      id: 71385,
      user_uid: 63170203,
      agenda_uid: 17026855,
      credential: 1,
      created_at: '2017-10-30 14:21:07',
      updated_at: '2017-10-30 14:21:07',
      store: JSON.stringify({
        custom_fields: {
          organization: 'Le Chat Fume',
          contact_number: '0688996549',
          contact_name: 'Th\\u00e9o Jouanneau',
          contact_position: 'directeur artistique',
          email: 'hello@lechatfume.fr',
        },
      }),
      organization: 'le-chat-fume',
      deleted_user: 0,
      actions_counter: 1,
    },
    {
      id: 71386,
      user_uid: 63170203,
      agenda_uid: 17026800,
      credential: 1,
      created_at: '2017-10-30 14:21:07',
      updated_at: '2017-10-30 14:21:07',
      store: JSON.stringify({
        custom_fields: {
          organization: 'Le Renard Fume',
          contact_number: '0681996549',
          contact_name: 'Th\\u00e9o Jouanneau',
          contact_position: 'directeur artistique',
          email: 'hello@lerenardfume.fr',
        },
      }),
      organization: 'le-renard-fume',
      deleted_user: 0,
      actions_counter: 0,
    },
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
      created_at: '2017-10-30 14:21:07',
      updated_at: '2017-10-30 14:21:07',
    },
  ]);

  await knex('event_2').insert([
    {
      id: 12,
      uid: 19201989,
      slug: 'un-event',
      owner_uid: 63170203,
      creator_uid: 63170203,
      timings: JSON.stringify([
        {
          begin: new Date('2019-05-06T10:00:00'),
          end: new Date('2019-05-06T11:00:00'),
        },
      ]),
      location_uid: 123,
      title: JSON.stringify({
        fr: 'Title 1',
      }),
      description: JSON.stringify({
        fr: 'Description 1',
      }),
      timezone: 'Europe/Paris',
      created_at: new Date('2019-05-06T10:00:00'),
      updated_at: new Date('2019-05-06T10:00:00'),
    },
    {
      id: 13,
      uid: 18992812,
      slug: 'encore-un-event',
      owner_uid: 63170203,
      creator_uid: 63170203,
      timings: JSON.stringify([
        {
          begin: new Date('2019-05-13T10:00:00'),
          end: new Date('2019-05-13T11:00:00'),
        },
      ]),
      image: JSON.stringify({
        filename: 'an-image.jpg',
      }),
      location_uid: 123,
      title: JSON.stringify({
        fr: 'Title 2',
      }),
      description: JSON.stringify({
        fr: 'Description 2',
      }),
      timezone: 'Europe/Paris',
      created_at: new Date('2019-05-06T10:00:00'),
      updated_at: new Date('2019-05-06T10:00:00'),
    },
  ]);

  await knex('agenda_event').insert([
    {
      event_uid: 19201989,
      agenda_uid: 17026855,
      user_uid: 63170203,
      state: 2,
      created_at: new Date('2019-05-06T10:00:00'),
      updated_at: new Date('2019-05-06T10:00:00'),
      can_edit: 1,
    },
    {
      event_uid: 18992812,
      agenda_uid: 17026855,
      user_uid: 63170203,
      state: 2,
      created_at: new Date('2019-05-06T10:00:00'),
      updated_at: new Date('2019-05-06T10:00:00'),
      can_edit: 1,
    },
  ]);

  await insertEventSet(knex, 1);
  await insertEventSet(knex, 2);

  await knex('custom').insert([
    {
      id: 9090,
      form_schema_id: 2,
      identifier: 19201989,
      store: JSON.stringify({
        'categories-agenda-metropolitain': 46,
      }),
      created_at: '2017-10-30 14:21:07',
      updated_at: '2017-10-30 14:21:07',
    },
  ]);
};
