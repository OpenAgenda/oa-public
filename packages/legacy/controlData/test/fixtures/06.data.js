import fs from 'node:fs';
import knexLib from 'knex';

const knex = knexLib({ client: 'mysql' });

const rawSQL = [
  'reset.sql',
  'review.create.sql',
  'review_embed.create.sql',
  'review_embed.sia2018.sql',
].map((fx) =>
  fs
    .readFileSync(`${import.meta.dirname}/sql/${fx}`, 'utf-8')
    .replace(/;(\n|)$/, ''));

const redisKeyContents = {
  101112: JSON.stringify({ ev: [], l: [] }),
};

export default {
  sql: `${rawSQL.join(';\n')};`,
  redisKeyContents,
};

rawSQL.push(
  knex('review').insert([
    {
      id: 13262,
      uid: 83549053,
      title: 'SIA 2018',
    },
  ]),
);
