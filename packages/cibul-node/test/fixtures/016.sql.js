import loadObjectFromFile from './loadObjectFromFile.js';
import insertEventSet from './sql/eventSets/index.js';

const load = loadObjectFromFile({ cwd: import.meta.dirname });

export default async (knex) => {
  await knex('user').insert([
    load('sql/users/thibaud.json'),
    load('sql/users/helene.json'),
  ]);

  await knex('review').insert([
    load('sql/agendas/metropole-europeenne-de-lille.json'),
    load('sql/agendas/laPiscineRoubaix.json'),
    load('sql/agendas/officedutourismeroubaix.json'),
  ]);

  await knex('reviewer').insert([
    load('sql/members/tb-adm-mel.json'),
    load('sql/members/ln-adm-rbx.json'),
  ]);

  await knex('location').insert([
    load('sql/locations/laPiscine.json'),
    load('sql/locations/laBaignoire.json'),
  ]);

  await knex('network').insert([
    load('sql/networks/mel.json'),
    load('sql/networks/villeDeRoubaix.json'),
  ]);

  await knex('form_schema').insert([
    {
      id: 41,
      store: JSON.stringify(load('form-schemas/41.json')),
    },
    {
      id: 374,
      store: JSON.stringify(load('form-schemas/374.json')),
    },
  ]);

  await insertEventSet(knex, 'saison-dexposition-de-lautomne-2020');
  await insertEventSet(knex, 'passCultureTestEvent');
};
