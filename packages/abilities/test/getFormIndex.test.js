import _ from 'lodash';

import abilities from '../src/service/index.js';
import testconfig from '../testconfig.js';
import setup, { reset } from './fixtures/setup.js';

const database = `${testconfig.mysql.database}_getFormIndex`;

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

describe('getFormIndex', () => {
  test('simple getFormIndex for a user', async () => {
    const ability = await abilities.get('user', 99999999);
    const index = await ability.getFormIndex();

    const strippedOfIds = index.map((i) => ({
      ..._.omit(i, ['id']),
      relevantRule: i.relevantRule
        ? _.omit(i.relevantRule, ['id'])
        : i.relevantRule,
    }));

    expect(strippedOfIds).toMatchSnapshot();
  });

  test('simple getFormIndex for an agenda', async () => {
    const ability = await abilities.get('agenda', 48959239);
    const index = await ability.getFormIndex();

    expect(index.map((i) => _.omit(i, ['id']))).toMatchSnapshot();
  });
});
