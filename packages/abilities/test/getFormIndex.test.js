import knexLib from 'knex';
import _ from 'lodash';

import abilities from '../src/service';
import testconfig from '../testconfig';
import db from './utils/db';

const database = `${testconfig.mysql.database}_getFormIndex`;

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

describe('getFormIndex', () => {
  test('simple getFormIndex for a user', async () => {
    const ability = await abilities.get('user', 99999999);
    const index = await ability.getFormIndex();

    const strippedOfIds = index.map(i => ({
      ..._.omit(i, ['id']),
      relevantRule: i.relevantRule ? _.omit(i.relevantRule, ['id']) : i.relevantRule,
    }));

    expect(strippedOfIds).toMatchSnapshot();
  });

  test('simple getFormIndex for an agenda', async () => {
    const ability = await abilities.get('agenda', 48959239);
    const index = await ability.getFormIndex();

    expect(index.map(i => _.omit(i, ['id']))).toMatchSnapshot();
  });
});
