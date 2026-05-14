import { jest } from '@jest/globals';
import testconfig from '../testconfig.js';
import Service from '../src/index.js';
import setup, { reset } from './fixtures/setup.js';

const data = [
  `${import.meta.dirname}/fixtures/feed.data.sql`,
  `${import.meta.dirname}/fixtures/feed_follow.data.sql`,
];

describe('activities - feed', () => {
  jest.setTimeout(30000);

  describe('without config', () => {
    it('use feed method throw an error', () =>
      expect(Service({})).rejects.toThrow());
  });

  describe('with config', () => {
    let knex;
    let service;

    beforeAll(async () => {
      knex = await setup({
        mysql: testconfig.mysql,
        schemas: testconfig.schemas,
        data,
      });
      service = await Service({ ...testconfig, knex });
    });

    beforeEach(() => reset(knex, { data }));

    afterAll(() => knex.destroy());

    it('call feed method with bad entity type', () => {
      expect(() => {
        service.feed({ entityType: 'badybad', entityUid: 1 }).create();
      }).toThrow('You cannot use feed of type badybad');
    });

    it('call feed method that works', async () => {
      await expect(
        service.feed({ entityType: 'user', entityUid: 1 }).create(),
      ).resolves.toMatchObject({ entityType: 'user', entityUid: 1 });
    });

    describe('get', () => {
      it('get a feed', () =>
        expect(
          service.feed({ entityType: 'user', entityUid: 42 }).get(),
        ).resolves.toMatchObject({ entityType: 'user', entityUid: 42 }));

      it('get a feed by his id', () =>
        expect(service.feed(2).get()).resolves.toMatchObject({
          entityType: 'user',
          entityUid: 42,
        }));

      it('get multiple feeds by ids', async () => {
        const feeds = await service.feed({ id: [2, 4] }).get();
        expect(feeds).toBeInstanceOf(Array);
        expect(feeds).toHaveLength(2);
        expect(feeds[0]).toMatchObject({ entityType: 'user', entityUid: 42 });
        expect(feeds[1]).toMatchObject({ entityType: 'user', entityUid: 44 });
      });

      it('get a feed with his follow', () =>
        expect(service.feed(4).get({ followed: true })).resolves.toMatchObject({
          entityType: 'user',
          entityUid: 44,
          followed: [{ id: 2, originFeed: 6, targetFeed: 4, store: {} }],
        }));

      it('get a feed with his followedBy', () =>
        expect(
          service.feed(4).get({ followedBy: true }),
        ).resolves.toMatchObject({
          entityType: 'user',
          entityUid: 44,
          followedBy: [
            { id: 3, originFeed: 4, targetFeed: 7, store: {} },
            { id: 4, originFeed: 4, targetFeed: 8, store: {} },
          ],
        }));

      it('get a feed with his follow & followedBy', () =>
        expect(
          service.feed(4).get({ followed: true, followedBy: true }),
        ).resolves.toMatchObject({
          entityType: 'user',
          entityUid: 44,
          followed: [{ id: 2, originFeed: 6, targetFeed: 4, store: {} }],
          followedBy: [
            { id: 3, originFeed: 4, targetFeed: 7, store: {} },
            { id: 4, originFeed: 4, targetFeed: 8, store: {} },
          ],
        }));

      it('get a feed by his id in an identifiers object', () =>
        expect(service.feed({ id: 2 }).get()).resolves.toMatchObject({
          entityType: 'user',
          entityUid: 42,
        }));

      it('get an inexistent feed', () =>
        expect(
          service.feed({ entityType: 'user', entityUid: 32 }).get(),
        ).resolves.toBeNull());

      it('get a feed with protected fields', () =>
        expect(service.feed(2).get({ internal: true })).resolves.toMatchObject({
          id: 2,
          entityType: 'user',
          entityUid: 42,
        }));
    });

    describe('create', () => {
      it('create a user feed', () =>
        expect(
          service.feed({ entityType: 'user', entityUid: 2 }).create(),
        ).resolves.toMatchObject({ entityType: 'user', entityUid: 2 }));

      it('create a user feed that already exists', () =>
        expect(
          service.feed({ entityType: 'user', entityUid: 42 }).create(),
        ).rejects.toThrow('Feed already exists'));

      it('create a user feed with not validated uid', async () => {
        const error = await service
          .feed({ entityType: 'user', entityUid: 'hmm' })
          .create()
          .then(
            () => null,
            (e) => e,
          );

        expect(error).toMatchObject([
          {
            field: 'entityUid',
            code: 'number.invalid',
            message: 'not a number',
            origin: 'hmm',
          },
        ]);
      });
    });

    describe('follow', () => {
      it('follow feed', () =>
        expect(service.feed({ id: 2 }).follow({ id: 5 })).resolves.toBe(8));

      it('follow feed that already followed', () =>
        expect(service.feed(4).follow(6)).rejects.toThrow(
          'Feed already followed',
        ));

      it('follow feed that does not exists', () =>
        expect(service.feed({ id: 2 }).follow({ id: 75 })).resolves.toBe(0));

      it('follow feed with a store', () =>
        expect(
          service
            .feed({ id: 2 })
            .follow({ id: 6 }, { blabla: 'car' })
            .then(() => service.feed({ id: 2 }).get({ followed: true })),
        ).resolves.toMatchObject({
          entityType: 'user',
          entityUid: 42,
          followed: [
            { id: 8, originFeed: 6, targetFeed: 2, store: { blabla: 'car' } },
          ],
        }));
    });

    describe('unfollow', () => {
      it('unfollow feed', async () => {
        await service.feed({ id: 2 }).follow({ id: 5 });
        return expect(
          service.feed({ id: 2 }).unfollow({ id: 5 }),
        ).resolves.toBe(1);
      });

      it('unfollow feed that does not exists', () =>
        expect(service.feed({ id: 2 }).unfollow({ id: 75 })).resolves.toBe(0));
    });

    describe('remove', () => {
      it('remove a user feed', () =>
        expect(
          service.feed({ entityType: 'user', entityUid: 42 }).remove(),
        ).resolves.toBe(1));

      it('remove a user feed by his id', () =>
        expect(service.feed({ id: 4 }).remove()).resolves.toBe(1));

      it('remove a user feed that not exist', () =>
        expect(
          service.feed({ entityType: 'user', entityUid: 32 }).remove(),
        ).resolves.toBe(0));
    });
  });
});
