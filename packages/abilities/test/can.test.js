import abilities from '../src/service/index.js';
import testconfig from '../testconfig.js';
import setup, { reset } from './fixtures/setup.js';

const database = `${testconfig.mysql.database}_can`;

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

describe('can', () => {
  test('simple can', async () => {
    const ability = await abilities.get('user', 99999999);

    expect(ability.can('receive', 'activity')).toBe(true);
    expect(ability.can('create', 'event')).toBe(true);
    expect(ability.can('remove', 'event')).toBe(false);
  });

  test('can with only default rules', async () => {
    const ability = await abilities.get('user', 123);

    expect(ability.can('receive', 'activity')).toBe(true);
  });

  test('can with conditions', async () => {
    const ability = await abilities.get('user', 12345678);

    expect(ability.can('receive', 'activity')).toBe(true);
    expect(ability.can('receive', 'activity', { verb: 'spam' })).toBe(false);
  });

  test('can with reverted conditions', async () => {
    const ability = await abilities.get('member', 60815);

    expect(ability.can('receive', 'activity')).toBe(true);
    expect(
      ability.can('receive', 'activity', { verb: 'agenda.eventChangeState' }),
    ).toBe(false);
  });

  test('can with reverted conditions before more global rule', async () => {
    const ability = await abilities.get('member', 60818);

    expect(ability.can('receive', 'activity')).toBe(false);
    expect(
      ability.can('receive', 'activity', { verb: 'agenda.eventChangeState' }),
    ).toBe(true);
  });

  test('compose ability for a member entity (agenda + user + member)', async () => {
    const ability = await abilities.get('member', 60815);

    expect(ability.can('receive', 'activity')).toBe(true);
    expect(ability.can('receive', 'activity', { verb: 'spam' })).toBe(false);
    expect(
      ability.can('receive', 'mail', { verb: 'agenda.eventPublished' }),
    ).toBe(true);
  });

  test('check abilities that have opposed rules but the same user entity', async () => {
    const userAbility = await abilities.get('user', 99999999);
    const memberAbility = await abilities.get('member', 60815);

    expect(userAbility.can('receive', 'eventUpdate')).toBe(true);
    expect(memberAbility.can('receive', 'eventUpdate')).toBe(false);
  });

  // filterBouncingAndUnsubscribed.js calls the ability with all four
  // positional arguments: can(action, subject, conditions, fields).
  test('can with the 4-arg (conditions, fields) production call shape', async () => {
    const ability = await abilities.get('user', 12345678);

    // 4-arg must agree with the shorter forms for the same conditions
    expect(ability.can('receive', 'activity', undefined, undefined)).toBe(true);
    expect(
      ability.can('receive', 'activity', { verb: 'spam' }, undefined),
    ).toBe(false);
    expect(
      ability.can('receive', 'activity', { verb: 'spam' }, undefined),
    ).toBe(ability.can('receive', 'activity', { verb: 'spam' }));

    // a passed field argument must not throw nor change the decision when no
    // rule is field-scoped (rules here declare no `fields`)
    expect(ability.can('receive', 'activity', undefined, 'title')).toBe(true);
  });
});
