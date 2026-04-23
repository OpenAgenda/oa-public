import loadObjectFromFile from './loadObjectFromFile.js';
import { knex } from './sql/index.js';

const load = loadObjectFromFile({ cwd: import.meta.dirname });

const raw = [];

raw.push(knex('user').insert([load('sql/users/01.json')]));

raw.push(knex('network').insert([load('sql/networks/01.json')]));

raw.push(knex('api_key_set').insert([load('sql/apiKeySets/01.json')]));

raw.push(
  knex('access_token').insert([
    load('sql/accessTokens/01.json'),
    load('sql/accessTokens/02.json'),
  ]),
);

raw.push(
  knex('review').insert([
    load('sql/agendas/01.json'),
    load('sql/agendas/02.json'),
    load('sql/agendas/03.json'),
    load('sql/agendas/04.json'),
    load('sql/agendas/05.json'),
  ]),
);

raw.push(
  knex('reviewer').insert([
    load('sql/members/01.json'),
    load('sql/members/02.json'),
    load('sql/members/03.json'),
    load('sql/members/04.json'),
  ]),
);

export default `${raw.join(';\n')};`;
