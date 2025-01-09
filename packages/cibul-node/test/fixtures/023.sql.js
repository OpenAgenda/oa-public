import loadObjectFromFile from './loadObjectFromFile.js';
import { knex, resetAndCreateTables } from './sql/index.js';

const load = loadObjectFromFile({ cwd: import.meta.dirname });

const raw = resetAndCreateTables();

raw.push(
  knex('user').insert([
    load('sql/users/thibaud.json', {
      id: 1,
      uid: 1,
    }),
    load('sql/users/helene.json'),
  ]),
);

raw.push(
  knex('api_key_set').insert([load('sql/apiKeySets/01.json', { user_id: 1 })]),
);

raw.push(
  knex('access_token').insert([
    load('sql/accessTokens/01.json'),
    load('sql/accessTokens/02.json'),
  ]),
);

raw.push(
  knex('review').insert([
    load('sql/agendas/metropole-europeenne-de-lille.json', {
      uid: 1234,
    }),
    load('sql/agendas/laPiscineRoubaix.json'),
    load('sql/agendas/officedutourismeroubaix.json'),
  ]),
);

raw.push(
  knex('reviewer').insert([
    load('sql/members/tb-adm-mel.json', { user_uid: 1, agenda_uid: 1234 }),
    load('sql/members/ln-adm-rbx.json'),
  ]),
);

raw.push(
  knex('location').insert([
    load('sql/locations/laPiscine.json', {
      ext_ids: '{"identifiers": ["default->laPiscine"]}',
    }),
    load('sql/locations/laBaignoire.json', {
      ext_ids: '{"identifiers": ["default->laBaignoire"]}',
    }),
  ]),
);

raw.push(
  knex('network').insert([
    load('sql/networks/mel.json'),
    load('sql/networks/villeDeRoubaix.json'),
  ]),
);

export default `${raw.join(';\n')};`;
