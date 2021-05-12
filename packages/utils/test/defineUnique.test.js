'use strict';

const defineUnique = require('../knex/defineUnique');
const fixtures = require('./fixtures');

describe('defineUnique', () => {
  let fx;
  beforeAll(async () => {
    fx = fixtures({
      database: 'utils_test',
      host: process.env.OA_MYSQL_TEST_HOST,
      user: process.env.OA_MYSQL_TEST_USER,
      password: process.env.OA_MYSQL_TEST_PASSWORD,
      ssl: true
    });

    await fx.load('defineUnique.sql');
  });

  afterAll(() => fx.destroyClient());

  it('returned value is unique', async () => {
    const eventUid = await defineUnique(
      fx.client,
      'ae',
      'event_uid',
      () => Math.ceil(Math.random() * 99999999)
    );

    expect(
      await fx.client('ae').first().where('event_uid', eventUid)
    ).toBe(undefined);
  });

  it('throws error after 1000 unsuccessful attempts', async () => {
    let error;
    try {
      await defineUnique(
        fx.client,
        'ae',
        'event_uid',
        () => 5956897
      );
    } catch (e) {
      error = e;
    }
    expect(error.message).toBe('Failed to define unique value for ae.event_uid');
  });
});
