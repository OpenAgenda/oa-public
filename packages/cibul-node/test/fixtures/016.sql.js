import loadObjectFromFile from './loadObjectFromFile.js';
import { knex, resetAndCreateTables } from './sql/index.js';
import insertEventSet from './sql/eventSets/index.js';

const load = loadObjectFromFile({ cwd: import.meta.dirname });

const raw = resetAndCreateTables();

raw.push(
  knex('user').insert([
    load('sql/users/thibaud.json'),
    load('sql/users/helene.json'),
  ]),
);

raw.push(
  knex('review').insert([
    load('sql/agendas/metropole-europeenne-de-lille.json'),
    load('sql/agendas/laPiscineRoubaix.json'),
    load('sql/agendas/officedutourismeroubaix.json'),
  ]),
);

raw.push(
  knex('reviewer').insert([
    load('sql/members/tb-adm-mel.json'),
    load('sql/members/ln-adm-rbx.json'),
  ]),
);

raw.push(
  knex('location').insert([
    load('sql/locations/laPiscine.json'),
    load('sql/locations/laBaignoire.json'),
  ]),
);

raw.push(
  knex('network').insert([
    load('sql/networks/mel.json'),
    load('sql/networks/villeDeRoubaix.json'),
  ]),
);

raw.push(
  knex('form_schema').insert([
    {
      id: 41,
      store: JSON.stringify(load('form-schemas/41.json')),
    },
    {
      id: 374,
      store: JSON.stringify(load('form-schemas/374.json')),
    },
  ]),
);

insertEventSet(knex, raw, 'saison-dexposition-de-lautomne-2020');
insertEventSet(knex, raw, 'passCultureTestEvent');

export default `${raw.join(';\n')};`;
