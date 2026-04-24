import abilities from '../src/service/index.js';
import testconfig from '../testconfig.js';
import setup, { reset } from './fixtures/setup.js';

const database = `${testconfig.mysql.database}_updateFormIndex`;

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

describe('updateFormIndex', () => {
  test('simple updateFormIndex for a user', async () => {
    const data = [
      {
        entityName: 'user',
        identifier: 99999999,
        actions: 'receive',
        subject: 'event',
        conditions: null,
        inverted: false,
      },
      {
        entityName: 'user',
        identifier: 99999999,
        actions: 'receive',
        subject: 'eventUpdate',
        conditions: null,
        inverted: true,
      },
      {
        entityName: 'member',
        identifier: 60815,
        actions: 'receive',
        subject: 'eventUpdate',
        conditions: null,
        inverted: false,
      },
    ];

    const ability = await abilities.get('user', 99999999);
    const memberAbility = await abilities.get('member', 60815);

    expect(ability.can('receive', 'event')).toBe(false);
    expect(ability.can('receive', 'eventUpdate')).toBe(true);
    expect(memberAbility.can('receive', 'eventUpdate')).toBe(false);

    await ability.updateFormIndex(data);
    const newAbility = await abilities.get('user', 99999999);
    const newMemberAbility = await abilities.get('member', 60815);

    expect(newAbility.can('receive', 'event')).toBe(true);
    expect(newAbility.can('receive', 'eventUpdate')).toBe(false);
    expect(newMemberAbility.can('receive', 'eventUpdate')).toBe(true);
  });
});
