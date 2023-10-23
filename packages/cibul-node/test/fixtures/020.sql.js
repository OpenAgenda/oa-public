'use strict';

const loadObjectFromFile = require('@openagenda/utils/loadObjectFromFile');

const load = loadObjectFromFile({
  cwd: __dirname,
});

const settingsWithConfiguredPass = load('passCulture/settings.json');

const {
  knex,
  resetAndCreateTables,
} = require('./sql');

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

module.exports = `${raw.join(';\n')};`;