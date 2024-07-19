import loadObjectFromFile from './loadObjectFromFile.mjs';
import { knex, resetAndCreateTables } from './sql/index.mjs';

const load = loadObjectFromFile({ cwd: import.meta.dirname });

const raw = resetAndCreateTables();

raw.push(knex('user').insert([
  load('sql/users/01.json'),
]));

raw.push(knex('review').insert([
  load('sql/agendas/01.json'),
  load('sql/agendas/02.json'),
  load('sql/agendas/03.json'),
  load('sql/agendas/04.json'),
  load('sql/agendas/05.json'),
]));

raw.push(knex('network').insert([
  load('sql/networks/01.json'),
]));

export default `${raw.join(';\n')};`;
