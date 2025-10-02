import knexLib from 'knex';
import fixtures from '@openagenda/fixtures';
import testconfig from '../testconfig.js';
import { initAndLoad } from './service/index.js';

const database = `${testconfig.mysql.database}_service`;

const serviceShape = {
  Inbox: expect.any(Function),
  InboxUsers: expect.any(Function),
  InboxUser: expect.any(Function),
  Conversations: expect.any(Function),
  Conversation: expect.any(Function),
  tasks: {
    sync: expect.any(Function),
  },
};

describe('service', () => {
  let knex;

  beforeEach(() => {
    knex = knexLib({
      schemas: testconfig.schemas,
      client: 'mysql2',
      connection: {
        ...testconfig.mysql,
        database,
      },
    });
  });

  afterEach(async () => {
    await knex.raw(`DROP DATABASE IF EXISTS ${database}`);
    await knex.destroy();
  });

  afterAll(async () => fixtures.getConnection().destroy());

  describe('init', () => {
    test('simple init', async () => {
      const service = initAndLoad(
        {
          ...testconfig,
          mysql: {
            ...testconfig.mysql,
            database,
          },
          knex,
          logger: { namespace: 'test:' },
        },
        [],
      );

      await expect(service).resolves.toMatchObject(serviceShape);

      await service;
    });

    test('init without migrations', async () => {
      const service = initAndLoad(
        {
          ...testconfig,
          mysql: { ...testconfig.mysql, database },
          migrations: null,
        },
        [],
      );

      await expect(service).resolves.toMatchObject(serviceShape);

      await service;
    });

    test('init with knex instance', async () => {
      const service = initAndLoad(
        {
          ...testconfig,
          mysql: { ...testconfig.mysql, database },
          knex,
          migrations: {
            tableName: 'test_migrations',
          },
        },
        [],
      );

      await expect(service).resolves.toMatchObject(serviceShape);

      await service;
    });
  });
});
