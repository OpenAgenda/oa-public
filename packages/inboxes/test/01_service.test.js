import knexLib from 'knex';
import testconfig from '../testconfig';
import { initAndLoad } from './service';

const database = `${testconfig.mysql.database}_service`;

const serviceShape = {
  Inbox: expect.any(Function),
  InboxUsers: expect.any(Function),
  InboxUser: expect.any(Function),
  Conversations: expect.any(Function),
  Conversation: expect.any(Function),
  tasks: {
    sync: expect.any(Function)
  }
};

describe('service', () => {
  let config;

  afterEach(async () => {
    await config.knex.raw(`DROP DATABASE IF EXISTS ${database}`);
    await config.knex.destroy();
  });

  describe('init', () => {
    test('simple init', async () => {
      const service = initAndLoad(
        {
          ...testconfig,
          mysql: { ...testconfig.mysql, database },
          logger: { namespace: 'test:' }
        },
        []
      );

      await expect(service).resolves.toMatchObject(serviceShape);

      ({ config } = await service);
    });

    test('init without migrations', async () => {
      const service = initAndLoad(
        {
          ...testconfig,
          mysql: { ...testconfig.mysql, database },
          migrations: null
        },
        []
      );

      await expect(service).resolves.toMatchObject(serviceShape);

      ({ config } = await service);
    });

    test('init with knex instance', async () => {
      const knex = knexLib({
        client: 'mysql',
        connection: { ...testconfig.mysql, database }
      });

      const service = initAndLoad(
        {
          ...testconfig,
          mysql: { ...testconfig.mysql, database },
          knex,
          migrations: {
            tableName: 'test_migrations'
          }
        },
        []
      );

      await expect(service).resolves.toMatchObject(serviceShape);

      ({ config } = await service);
    });
  });
});
