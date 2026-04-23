import loadObjectFromFile from './loadObjectFromFile.js';
import { knex } from './sql/index.js';
import insertEventSet from './sql/eventSets/index.js';

const load = loadObjectFromFile({ cwd: import.meta.dirname });

const raw = [];

raw.push(
  knex('form_schema').insert([
    {
      id: 10428,
      store: JSON.stringify(load('form-schemas/arles.json')),
    },
  ]),
);

raw.push(knex('review').insert([load('sql/agendas/arles.json')]));

raw.push(
  knex('network').insert([
    {
      id: 1,
      uid: 1,
      created_at: '2016-01-11 13:07:08',
      updated_at: '2016-01-18 16:14:06',
      title: 'Un réseau',
    },
  ]),
);

raw.push(knex('user').insert([load('sql/users/janine.json')]));

raw.push(knex('reviewer').insert([load('sql/members/janine-adm-arles.json')]));

raw.push(
  knex('location').insert([
    load('sql/locations/boutique.json'),
    load('sql/locations/chezVous.json'),
  ]),
);

insertEventSet(knex, raw, '6');
insertEventSet(knex, raw, 'videoReportage');

export default `${raw.join(';\n')};`;
