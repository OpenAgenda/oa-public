import knexLib from 'knex';
import testconfig from '../testconfig';
import { initAndLoad, seed } from './service';

const database = `${testconfig.mysql.database}_Inbox`;
const tables = ['inbox'];

describe('Inbox', () => {
  let service;
  let Inbox;
  let InboxUsers;
  let Conversations;
  let knex;

  beforeAll(() => {
    knex = knexLib({
      schemas: testconfig.schemas,
      client: 'mysql',
      connection: {
        ...testconfig.mysql,
        database,
      },
    });
  });

  beforeAll(async () => {
    service = await initAndLoad(
      {
        ...testconfig,
        knex,
        mysql: { ...testconfig.mysql, database },
      },
      []
    );

    ({ Inbox, InboxUsers, Conversations } = service);
  });

  beforeEach(async () => {
    await service.config.knex.transaction(async trx => {
      await trx.raw('SET foreign_key_checks = 0');
      for (const table of tables) {
        await trx(service.config.schemas[table]).truncate();
      }
      await trx.raw('SET foreign_key_checks = 1');
    });

    await seed(
      {
        ...testconfig,
        mysql: { ...testconfig.mysql, database },
      },
      tables
    );
  });

  afterAll(async () => {
    await service.config.knex.raw(`DROP DATABASE IF EXISTS ${database}`);
    await service.config.knex.destroy();
  });

  describe('instanciate', () => {
    test('instanciate Inbox with constructor', () => {
      const inbox = new Inbox(42);

      expect(inbox).toBeInstanceOf(Inbox);
    });

    test('instanciate Inbox with bad id type throw a validation error', async () => {
      await expect(new Inbox('bad').get()).rejects.toMatchObject({
        name: 'ValidationError',
        info: {
          errors: {
            id: {
              code: 'type.integer',
            },
          },
        },
      });
    });

    test('instanciate Inbox with bad identifiers format throw a validation error', async () => {
      await expect(
        new Inbox({ type: 45, identifier: 'fezsf' }).get()
      ).rejects.toMatchObject({
        name: 'ValidationError',
        info: {
          errors: {
            type: {
              code: 'type.string',
            },
            identifier: {
              code: 'type.integer',
            },
          },
        },
      });
    });
  });

  describe('create', () => {
    test('create an inbox', async () => {
      const inbox = await new Inbox().create({
        type: 'agenda',
        identifier: 1245685,
      });

      expect(inbox.toJSON()).toEqual({
        id: 9,
        type: 'agenda',
        identifier: 1245685,
      });
    });

    test('create an inbox that already exist', async () => {
      const inbox = await new Inbox().create({
        type: 'user',
        identifier: 45645678,
      });

      expect(inbox.toJSON()).toEqual({
        id: 3,
        type: 'user',
        identifier: 45645678,
      });
    });

    test('create an inbox with invalid type', async () => {
      await expect(
        new Inbox().create({ type: 58, identifier: 99999999 })
      ).rejects.toMatchObject({
        name: 'ValidationError',
        info: {
          errors: {
            type: {
              code: 'type.string',
            },
          },
        },
      });
    });

    test('create an inbox with missing identifier', async () => {
      await expect(
        new Inbox().create({ type: 'agenda' })
      ).rejects.toMatchObject({
        name: 'ValidationError',
        info: {
          errors: {
            identifier: {
              code: 'required',
            },
          },
        },
      });
    });
  });

  describe('remove', () => {
    test('remove an inbox', async () => {
      const inbox = await new Inbox({
        type: 'agenda',
        identifier: 48959239,
      }).remove();

      expect(inbox.data).toBe(null);
    });
  });

  describe('get', () => {
    test('get an inbox by identifiers', async () => {
      const inbox = await new Inbox({
        type: 'agenda',
        identifier: 48959239,
      }).get();

      expect(inbox.toJSON()).toEqual({
        id: 1,
        type: 'agenda',
        identifier: 48959239,
      });
    });

    test('get an inbox by id', async () => {
      const inbox = await new Inbox(1).get();

      expect(inbox.toJSON()).toEqual({
        id: 1,
        type: 'agenda',
        identifier: 48959239,
      });
    });

    test("get an inbox that doesn't exist", async () => {
      const inbox = await new Inbox(42).get();

      expect(inbox.toJSON()).toBe(null);
    });

    test("get an inbox that doesn't exist but can be created", async () => {
      const inbox = await new Inbox({ type: 'user', identifier: 678910 }).get();

      expect(inbox.toJSON()).toEqual({
        id: 9,
        type: 'user',
        identifier: 678910,
      });
    });
  });

  describe('toJSON', () => {
    test('toJSON return data', async () => {
      const inbox = await new Inbox(1).get();

      expect(inbox.toJSON()).toEqual({
        id: 1,
        type: 'agenda',
        identifier: 48959239,
      });
    });

    test('toJSON return null when the Inbox is not getted', () => {
      expect(new Inbox(1).toJSON()).toBe(null);
    });
  });

  describe('link users', () => {
    test('.users is an instance of InboxUsers', () => {
      const inbox = new Inbox(1).users;

      expect(inbox).toBeInstanceOf(InboxUsers);
    });
  });

  describe('link conversations', () => {
    test('.conversations is an instance of Conversations', () => {
      const inbox = new Inbox(1).conversations;

      expect(inbox).toBeInstanceOf(Conversations);
    });
  });
});
