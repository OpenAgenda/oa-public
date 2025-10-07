import 'dotenv/config';

import Unsubscriptions from '../index.js';
import fixtures from './fixtures/index.js';

const dbConfig = {
  host: process.env.MYSQL_HOST,
  password: process.env.MYSQL_PASSWORD,
  user: process.env.MYSQL_USER,
  ssl: { rejectUnauthorized: false },
};

describe('registry', () => {
  let client;
  let service;

  beforeAll(async () => {
    client = await fixtures(dbConfig);
    service = Unsubscriptions({
      secret: 'secret',
      knex: client,
    });
  });

  test('email added to registry is hashed', async () => {
    const [insertId] = await service.registry.add('my@email.com');

    const row = await client('unsubscription').first().where('id', insertId);

    expect(row.email).toBe(
      'cf3d8259741b19a2b09e17d4fa9a97c63adc44bf2a5fa075cdcb5491f525feaa',
    );
  });

  test('isRegistered on email that is not registered returns false', async () => {
    expect(await service.registry.isRegistered('unregistered@email.com')).toBe(
      false,
    );
  });

  test('isRegistered on email that is registered returns true', async () => {
    await service.registry.add('registered@email.com');

    expect(await service.registry.isRegistered('registered@email.com')).toBe(
      true,
    );
  });

  test('add does not add same email multiple times', async () => {
    const [insertId] = await service.registry.add('plouign@email.com');

    expect(typeof insertId).toBe('number');

    expect(await service.registry.add('plouign@email.com')).toBeUndefined();
  });

  test('transfer transfers legacy table emails to registry', async () => {
    const count = await service.registry.transfer();

    expect(count).toBe(4);

    expect(
      await service.registry.isRegistered('utilisateur3@example.com'),
    ).toBe(true);
  });

  afterAll(async () => {
    client.destroy();
  });
});
