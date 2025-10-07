import loadObjectFromFile from './loadObjectFromFile.js';
import { knex, resetAndCreateTables } from './sql/index.js';

const load = loadObjectFromFile({ cwd: import.meta.dirname });

const settingsWithConfiguredPass = load('passCulture/settings.json');

const raw = resetAndCreateTables();

raw.push(
  knex('review').insert([
    load('sql/agendas/218.json', {
      uid: 2010,
      settings: JSON.stringify(settingsWithConfiguredPass),
      form_schema_id: null,
    }),
  ]),
);

raw.push(
  knex('location').insert([
    load('sql/locations/1.json', {
      uid: 1234,
    }),
  ]),
);

// Add users for testing
raw.push(
  knex('user').insert([
    load('sql/users/01.json'), // userUid: 1
    {
      id: 82253124,
      uid: 82253124,
      full_name: 'Test Moderator',
      created_at: '2017-10-30 14:21:07',
      updated_at: '2017-10-30 14:21:07',
      password: 'xxx',
      salt: 'xxx',
    },
    {
      id: 63170203,
      uid: 63170203,
      full_name: 'Test Contributor',
      created_at: '2017-10-30 14:21:07',
      updated_at: '2017-10-30 14:21:07',
      password: 'xxx',
      salt: 'xxx',
    },
    {
      id: 99999999,
      uid: 99999999,
      full_name: 'Test Moderator 2',
      created_at: '2017-10-30 14:21:07',
      updated_at: '2017-10-30 14:21:07',
      password: 'xxx',
      salt: 'xxx',
    },
  ]),
);

// Add members for agenda 2010
raw.push(
  knex('reviewer').insert([
    {
      id: 1001,
      user_uid: 82253124,
      agenda_uid: 2010,
      credential: 2, // moderator role
      created_at: '2017-10-30 14:21:07',
      updated_at: '2017-10-30 14:21:07',
      deleted_user: 0,
      actions_counter: 0,
    },
    {
      id: 1002,
      user_uid: 63170203,
      agenda_uid: 2010,
      credential: 1, // contributor role
      created_at: '2017-10-30 14:21:07',
      updated_at: '2017-10-30 14:21:07',
      deleted_user: 0,
      actions_counter: 0,
    },
  ]),
);

export default `${raw.join(';\n')};`;
