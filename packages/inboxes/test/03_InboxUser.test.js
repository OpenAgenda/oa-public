import _ from 'lodash';
import knexLib from 'knex';
import testconfig from '../testconfig';
import { initAndLoad, seed } from './service';

const database = `${testconfig.mysql.database}_InboxUser`;
const tables = ['inbox', 'inboxUser'];

describe('InboxUser', () => {
  let service;
  let Inbox;
  let InboxUsers;
  let InboxUser;
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
        mysql: { ...testconfig.mysql, database },
        knex,
      },
      []
    );

    ({ Inbox, InboxUsers, InboxUser } = service);
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

  describe('create', () => {
    test('create an inbox user', async () => {
      const inboxUser = await new Inbox({
        type: 'agenda',
        identifier: 48959239,
      }).users.add({ userUid: 12341234 });

      expect(inboxUser.toJSON()).toEqual({
        id: 10,
        inboxId: 1,
        userUid: 12341234,
        leftAt: null,
      });
    });

    test('create an already existant inbox user', async () => {
      const inboxUser = await new Inbox({
        type: 'agenda',
        identifier: 48959239,
      }).users.add({ userUid: 23456789 });

      expect(inboxUser.toJSON()).toEqual({
        id: 1,
        inboxId: 1,
        userUid: 23456789,
        leftAt: null,
      });
    });

    test('create an inbox user - inbox not found', async () => {
      await expect(
        new Inbox({ type: 'agenda', identifier: 12341234 }).users.add({
          userUid: 99999999,
        })
      ).rejects.toMatchObject({
        message: "Inbox { type: 'agenda', identifier: 12341234 } not found",
      });
    });

    test('re-add an inbox user that have been deleted', async () => {
      const inboxUser = await new Inbox(4).users.add({ userUid: 89216486 });

      expect(inboxUser.data.userUid).toBe(89216486);
      expect(inboxUser.data.id).toBe(4);
    });
  });

  describe('get', () => {
    describe('get passing by an inbox', () => {
      test('get an inbox user by identifiers', async () => {
        const inboxUser = await new Inbox(1).users.get({ userUid: 23456789 });

        expect(inboxUser.toJSON()).toEqual({
          id: 1,
          inboxId: 1,
          userUid: 23456789,
          leftAt: null,
        });
      });

      test('get an inbox user by id', async () => {
        const inboxUser = await new Inbox(1).users.get(1);

        expect(inboxUser.toJSON()).toEqual({
          id: 1,
          inboxId: 1,
          userUid: 23456789,
          leftAt: null,
        });
      });

      test('get a detailed inbox user', async () => {
        const inboxUser = await new Inbox(1).users.get(1, { detailed: true });

        expect(inboxUser.toJSON()).toEqual({
          id: 1,
          inboxId: 1,
          userUid: 23456789,
          name: 'Jean-Roger Benbambou',
          avatar:
            'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
          leftAt: null,
          uid: 23456789,
        });
      });

      test("get an inbox user that doesn't exist", async () => {
        const inboxUser = await new Inbox(1).users.get(42);

        expect(inboxUser.toJSON()).toBeNull();
      });
    });

    describe('get directly', () => {
      test('get an inbox user by id', async () => {
        const inboxUser = await new InboxUser(1).get();

        expect(inboxUser.toJSON()).toEqual({
          id: 1,
          inboxId: 1,
          userUid: 23456789,
          leftAt: null,
        });
      });

      test('get an inbox user by identifiers', async () => {
        const inboxUser = await new InboxUser({
          inboxId: 2,
          userUid: 99999999,
        }).get();

        expect(inboxUser.toJSON()).toEqual({
          id: 2,
          inboxId: 2,
          userUid: 99999999,
          leftAt: null,
        });
      });

      test('get an inbox user by identifiers with missing inboxId', async () => {
        await expect(
          new InboxUser({ userUid: 99999999 }).get()
        ).rejects.toMatchObject({
          jse_info: {
            errors: {
              inboxId: {
                code: 'required',
              },
            },
          },
        });
      });
    });
  });

  describe('list', () => {
    test('list inbox users of an inbox', async () => {
      const inboxUsers = await new Inbox(4).users.list();

      expect(inboxUsers.data).toEqual([
        {
          id: 3,
          inboxId: 4,
          userUid: 56484348,
          leftAt: null,
        },
        {
          id: 4,
          inboxId: 4,
          userUid: 89216486,
          leftAt: new Date('2017-09-28T18:22:04.000Z'),
        },
      ]);
    });

    test('list inbox users of an inbox (without lefted)', async () => {
      const inboxUsers = await new Inbox(4).users.list({ leftAt: false });

      expect(inboxUsers.toJSON()).toEqual([
        {
          id: 3,
          inboxId: 4,
          userUid: 56484348,
          leftAt: null,
        },
      ]);
    });

    test('list inbox users of some inboxes', async () => {
      const inboxUsers = await new InboxUsers().list({
        inboxId: [1, 2],
      });

      expect(inboxUsers.toJSON()).toEqual([
        {
          id: 1,
          inboxId: 1,
          userUid: 23456789,
          leftAt: null,
        },
        {
          id: 2,
          inboxId: 2,
          userUid: 99999999,
          leftAt: null,
        },
        {
          id: 8,
          inboxId: 1,
          userUid: 32132112,
          leftAt: null,
        },
      ]);
    });

    test('list inbox users attached to a user', async () => {
      const inboxUsers = await new InboxUsers().list({
        userUid: 99999999,
      });

      expect(inboxUsers.toJSON()).toEqual([
        {
          id: 2,
          inboxId: 2,
          userUid: 99999999,
          leftAt: null,
        },
        {
          id: 5,
          inboxId: 5,
          userUid: 99999999,
          leftAt: null,
        },
      ]);
    });

    test('list inbox users with missing inboxId', async () => {
      await expect(new InboxUsers().list()).rejects.toMatchObject({
        jse_info: {
          errors: {
            inboxId: {
              code: 'required',
            },
          },
        },
      });
    });
  });

  describe('remove', () => {
    test('remove an inbox user', async () => {
      const user = await new Inbox(4).users.remove({ userUid: 56484348 });

      expect(user.toJSON().leftAt).toBeInstanceOf(Date);
      expect(_.omit(user.toJSON(), 'leftAt')).toEqual({
        id: 3,
        inboxId: 4,
        userUid: 56484348,
      });
    });
  });
});
