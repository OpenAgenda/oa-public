import _ from 'lodash';

import abilities from '../src/service/index.js';
import testconfig from '../testconfig.js';
import setup, { reset } from './fixtures/setup.js';

const database = `${testconfig.mysql.database}_get`;

let knex;

beforeAll(async () => {
  knex = await setup({
    mysql: { ...testconfig.mysql, database },
    schemas: testconfig.schemas,
  });
  abilities.init({ ...testconfig, knex });
});

beforeEach(() => reset(knex));

afterAll(() => knex.destroy());

describe('get', () => {
  test('simple get for a user', async () => {
    const ability = await abilities.get('user', 99999999);

    expect(ability.rules.map((r) => _.omit(r, ['id']))).toMatchSnapshot();
  });

  test('get with a bad identifier object should throw an error', async () => {
    await expect(abilities.get('user', {})).rejects.toThrow(
      '`identifier` should be a number',
    );
  });
});
