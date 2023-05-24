import _ from 'lodash';
import knexLib from 'knex';

import abilities from '../src/service';
import testconfig from '../testconfig';
import db from './utils/db';

const database = `${testconfig.mysql.database}_get`;
let knex;

beforeAll(async () => {
  await db.create({
    ...testconfig.mysql,
    database,
  });

  knex = knexLib({
    schemas: testconfig.schemas,
    client: 'mysql',
    connection: { ...testconfig.mysql },
  });

  abilities.init({
    ...testconfig,
    knex,
  });

  await abilities.config.migrate();
});

beforeEach(async () => {
  await abilities.config.seed('firstTest');
});

afterAll(async () => {
  try {
    await knex.raw(`DROP DATABASE IF EXISTS ${database}`);
  } catch (e) {
    // console.log(e);
  }
  await knex.destroy();
});

describe('get', () => {
  test('simple get for a user', async () => {
    const ability = await abilities.get('user', 99999999);

    expect(ability.rules.map(r => _.omit(r, ['id']))).toMatchSnapshot();
  });

  test('get with a bad identifier object should throw an error', async () => {
    await expect(abilities.get('user', {})).rejects.toThrow(
      '`identifier` should be a number',
    );
  });
});
