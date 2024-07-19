import loadObjectFromFile from './loadObjectFromFile.mjs';
import { knex, resetAndCreateTables } from './sql/index.mjs';

const load = loadObjectFromFile({ cwd: import.meta.dirname });

const settingsWithConfiguredPass = load('passCulture/settings.json');

const raw = resetAndCreateTables();

raw.push(knex('review').insert([
  load('sql/agendas/218.json', {
    uid: 2010,
    settings: JSON.stringify(settingsWithConfiguredPass),
    form_schema_id: null,
  }),
]));

raw.push(knex('location').insert([
  load('sql/locations/1.json', {
    uid: 1234,
  }),
]));

export default `${raw.join(';\n')};`;
