import fs from 'node:fs';
import knexLib from 'knex';

const knex = knexLib({ client: 'mysql2' });

const raw = [
  fs.readFileSync(`${import.meta.dirname}/reset.sql`, 'utf-8'),
  fs
    .readFileSync(`${import.meta.dirname}/../../model.sql`, 'utf-8')
    // eslint-disable-next-line no-template-curly-in-string
    .replace('${schema}', 'network'),
];

raw.push(
  knex('network').insert([
    {
      uid: 1,
      form_schema_id: 2,
      updated_at: new Date('1981-02-28T03:00:00.000Z'),
      created_at: new Date('1981-02-28T03:00:00.000Z'),
      title: 'Métropole de Toulouse',
    },
    {
      uid: 13,
      form_schema_id: 12,
      updated_at: new Date('1981-02-28T03:00:00.000Z'),
      created_at: new Date('1981-02-28T03:00:00.000Z'),
      title: 'Métropole de Lille',
    },
    {
      uid: 3,
      form_schema_id: 21,
      updated_at: new Date('1981-02-28T03:00:00.000Z'),
      created_at: new Date('1981-02-28T03:00:00.000Z'),
      title: 'Orléans Métropole',
    },
  ]),
);

export default raw.join('\n');
