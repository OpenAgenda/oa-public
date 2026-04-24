import load from './loadObjectFromFile.js';
import insertEventSet from './sql/eventSets/index.js';

export default async (knex) => {
  await knex('user').insert([load('sql/users/janine.json')]);

  await knex('form_schema').insert([
    {
      id: 10428,
      store: JSON.stringify(load('form-schemas/arles.json')),
    },
  ]);

  await knex('review').insert([load('sql/agendas/arles.json')]);

  await knex('network').insert([
    {
      id: 1,
      uid: 1,
      created_at: '2016-01-11 13:07:08',
      updated_at: '2016-01-18 16:14:06',
      title: 'Un réseau',
    },
  ]);

  await knex('reviewer').insert([load('sql/members/janine-adm-arles.json')]);

  await knex('location').insert([
    load('sql/locations/boutique.json'),
    load('sql/locations/chezVous.json'),
  ]);

  await insertEventSet(knex, '6');
  await insertEventSet(knex, 'videoReportage');
};
