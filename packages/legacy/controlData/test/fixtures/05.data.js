import fs from 'node:fs';

const rawSQL = ['reset.sql'].map((fx) =>
  fs
    .readFileSync(`${import.meta.dirname}/sql/${fx}`, 'utf-8')
    .replace(/;(\n|)$/, ''));

const redisKeyContents = {
  789: JSON.stringify({ ev: [], l: [] }),
};

export default {
  sql: `${rawSQL.join(';\n')};`,
  redisKeyContents,
};
