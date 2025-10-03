'use strict';

const _ = require('lodash');
const knexLib = require('knex');
const config = require('../testconfig');
const Service = require('./service');

let service;

describe('activities - notifications', () => {
  beforeEach(async () => {
    service = await Service.initAndLoad({
      ...config,
      knex: knexLib({
        client: 'mysql2',
        connection: config.mysql,
      }),
    });
  });

  // afterEach(() => service.shutdown);

  describe('get', () => {
    it('get a notification with a bad query', async () => {
      const error = await service
        .feed({ entityType: 'user', entityUid: 42 })
        .notifications.get({ verb: {} })
        .then(
          () => null,
          (e) => e,
        );

      expect(error).toMatchObject({
        message: 'Query validation failed',
        info: {
          errors: [
            {
              field: 'verb',
              code: 'string.invalidtype',
              message: 'not a string',
              origin: {},
            },
          ],
        },
      });
    });

    it('get a notification', () =>
      expect(
        service
          .feed({ entityType: 'user', entityUid: 42 })
          .notifications.get({
            verb: 'event.create',
            groupBy: 'target:agenda:48648352',
          })
          .then((notif) => {
            expect(notif.createdAt).toBeInstanceOf(Date);
            expect(notif.updatedAt).toBeInstanceOf(Date);
            return _.omit(notif, 'createdAt', 'updatedAt');
          }),
      ).resolves.toMatchObject({
        id: 1,
        feedId: 2,
        verb: 'event.create',
        groupBy: 'target:agenda:48648352',
        store: {
          actor: ['user:45645612'],
          object: ['event:98798765'],
          target: ['agenda:48648352'],
          labels: {
            actor: 'Sonny',
            object: 'Réunion des junkies anonymes',
            target: 'Apéro du matin',
          },
        },
        state: 0,
        sent: 0,
      }));

    it("get a notification that doesn't exist", () =>
      expect(
        service.feed({ entityType: 'user', entityUid: 42 }).notifications.get({
          verb: 'event.create',
          groupBy: 'target:agenda:48648352',
          state: 2,
        }),
      ).resolves.toBeUndefined());

    it("get a notification of a feed that doesn't exists", () =>
      expect(
        service.feed({ entityType: 'user', entityUid: 84 }).notifications.get({
          verb: 'event.create',
          groupBy: 'target:agenda:48648352',
        }),
      ).rejects.toThrow('Feed not found'));

    it("get a notification of a feed that isn't a user feed", () =>
      expect(
        service
          .feed({ entityType: 'agenda', entityUid: 86 })
          .notifications.get({
            verb: 'event.create',
            groupBy: 'target:agenda:48648352',
          }),
      ).rejects.toThrow('The notifications concern only feeds of type user'));
  });

  describe('addActivity', () => {
    it('add an activity to a new notification', () =>
      expect(
        service
          .feed({ entityType: 'user', entityUid: 42 })
          .notifications.addActivity({
            actor: 'user:12312312',
            verb: 'event.create',
            object: 'event:78978978',
            target: 'agenda:66666666',
            store: {
              labels: {
                actor: 'Jacky',
                object: 'Réunion des junkies anonymes 2',
                target: 'La fumette',
              },
            },
          })
          .then((notif) => {
            expect(notif.createdAt).toBeInstanceOf(Date);
            expect(notif.updatedAt).toBeInstanceOf(Date);
            return _.omit(notif, 'createdAt', 'updatedAt');
          }),
      ).resolves.toMatchObject({
        id: 6,
        feedId: 2,
        verb: 'event.create',
        groupBy: 'target:agenda:66666666',
        store: {
          actor: ['user:12312312'],
          object: ['event:78978978'],
          target: ['agenda:66666666'],
          labels: {
            actor: 'Jacky',
            object: 'Réunion des junkies anonymes 2',
            target: 'La fumette',
          },
        },
        state: 0,
        sent: 0,
      }));

    it('add an activity grouped by a property in store to a new notification', () =>
      expect(
        service
          .feed({ entityType: 'user', entityUid: 42 })
          .notifications.addActivity({
            actor: 'user:12312312',
            verb: 'agenda.changeEventState',
            object: 'event:78978978',
            target: 'agenda:66666667',
            store: {
              labels: {
                actor: 'Jacky',
                object: 'Réunion des junkies anonymes 2',
                target: 'La fumette',
              },
              newState: 2,
            },
          })
          .then((notif) => {
            expect(notif.createdAt).toBeInstanceOf(Date);
            expect(notif.updatedAt).toBeInstanceOf(Date);
            return _.omit(notif, 'createdAt', 'updatedAt');
          }),
      ).resolves.toMatchObject({
        id: 6,
        feedId: 2,
        verb: 'agenda.changeEventState',
        groupBy: 'target:agenda:66666667|store.newState:2',
        store: {
          actor: ['user:12312312'],
          object: ['event:78978978'],
          target: ['agenda:66666667'],
          labels: {
            actor: 'Jacky',
            object: 'Réunion des junkies anonymes 2',
            target: 'La fumette',
          },
          newState: 2,
        },
        state: 0,
        sent: 0,
      }));

    it('add an activity grouped by a property in store to an existant notification', () =>
      expect(
        service
          .feed({ entityType: 'user', entityUid: 42 })
          .notifications.addActivity({
            actor: 'user:12312315',
            verb: 'agenda.changeEventState',
            object: 'event:78978978',
            target: 'agenda:66666666',
            store: {
              labels: {
                actor: 'Jacky',
                object: 'Réunion des junkies anonymes 2',
                target: 'La fumette',
              },
              newState: 2,
            },
          })
          .then((notif) => {
            expect(notif.createdAt).toBeInstanceOf(Date);
            expect(notif.updatedAt).toBeInstanceOf(Date);
            return _.omit(notif, 'createdAt', 'updatedAt');
          }),
      ).resolves.toMatchObject({
        id: 5,
        feedId: 2,
        verb: 'agenda.changeEventState',
        groupBy: 'target:agenda:66666666|store.newState:2',
        store: {
          actor: ['user:12312312', 'user:12312315'],
          object: ['event:78978999', 'event:78978978'],
          target: ['agenda:66666666'],
          labels: {
            actor: 'Jacky',
            object: 'Réunion des junkies anonymes 2',
            target: 'La fumette',
          },
          newState: 2,
        },
        state: 0,
        sent: 0,
      }));

    it('add an activity to an existant notification', () =>
      expect(
        service
          .feed({ entityType: 'user', entityUid: 42 })
          .notifications.addActivity({
            actor: 'user:86868686',
            verb: 'event.create',
            object: 'event:12312345',
            target: 'agenda:48648352',
            store: {
              labels: {
                actor: 'Jacky',
                object: 'Réunion des junkies anonymes 2',
                target: 'La fumette',
              },
            },
          })
          .then((notif) => {
            expect(notif.createdAt).toBeInstanceOf(Date);
            expect(notif.updatedAt).toBeInstanceOf(Date);
            return _.omit(notif, 'createdAt', 'updatedAt');
          }),
      ).resolves.toMatchObject({
        id: 1,
        feedId: 2,
        verb: 'event.create',
        groupBy: 'target:agenda:48648352',
        store: {
          actor: ['user:45645612', 'user:86868686'],
          object: ['event:98798765', 'event:12312345'],
          target: ['agenda:48648352'],
          labels: {
            actor: 'Jacky',
            object: 'Réunion des junkies anonymes 2',
            target: 'La fumette',
          },
        },
        state: 0,
        sent: 0,
      }));

    it('add an activity to an inexistant feed', () =>
      expect(
        service
          .feed({ entityType: 'user', entityUid: 86 })
          .notifications.addActivity({
            actor: 'user:86868686',
            verb: 'event.create',
            object: 'event:12312345',
            target: 'agenda:48648352',
            store: {
              labels: {
                actor: 'Jacky',
                object: 'Réunion des junkies anonymes 2',
                target: 'La fumette',
              },
            },
          }),
      ).rejects.toThrow('Feed not found'));

    it('add an activity to an agenda feed', () =>
      expect(
        service
          .feed({ entityType: 'agenda', entityUid: 86 })
          .notifications.addActivity({
            actor: 'user:86868686',
            verb: 'agenda.create',
            target: 'agenda:48648352',
            store: {
              labels: {
                actor: 'Jacky',
                target: 'La fumette',
              },
            },
          }),
      ).rejects.toMatchObject({
        message: "Feed of type 'agenda' can't have notifications",
        code: 'FEED_REJECTS_NOTIFICATION',
      }));
  });

  describe('count', () => {
    it('count notifications of a user feed', () =>
      expect(
        service
          .feed({ entityType: 'user', entityUid: 42 })
          .notifications.count(),
      ).resolves.toBe(4));

    it('count read notifications of a user feed', () =>
      expect(
        service
          .feed({ entityType: 'user', entityUid: 42 })
          .notifications.count({ state: 1 }),
      ).resolves.toBe(0));

    it('count notifications of an inexistant feed', () =>
      expect(
        service
          .feed({ entityType: 'user', entityUid: 85 })
          .notifications.count(),
      ).rejects.toThrow('Feed not found'));
  });

  describe('markAs', () => {
    it('mark a notification as read', () =>
      expect(
        service
          .feed({ entityType: 'user', entityUid: 42 })
          .notifications.markAs(
            { verb: 'event.create', groupBy: 'target:agenda:48648352' },
            2,
          )
          .then(([notif]) => {
            expect(notif.createdAt).toBeInstanceOf(Date);
            expect(notif.updatedAt).toBeInstanceOf(Date);
            return _.omit(notif, 'createdAt', 'updatedAt');
          }),
      ).resolves.toMatchObject({
        id: 1,
        feedId: 2,
        verb: 'event.create',
        groupBy: 'target:agenda:48648352',
        store: {
          actor: ['user:45645612'],
          object: ['event:98798765'],
          target: ['agenda:48648352'],
          labels: {
            actor: 'Sonny',
            object: 'Réunion des junkies anonymes',
            target: 'Apéro du matin',
          },
        },
        state: 2,
        sent: 0,
      }));

    it('mark some notifications of a feed as read', () =>
      expect(
        service
          .feed({ entityType: 'user', entityUid: 42 })
          .notifications.markAs({ verb: 'event.create' }, 2)
          .then((notifs) =>
            notifs.map((notif) => {
              expect(notif.createdAt).toBeInstanceOf(Date);
              expect(notif.updatedAt).toBeInstanceOf(Date);
              return _.omit(notif, 'createdAt', 'updatedAt');
            })),
      ).resolves.toMatchObject([
        {
          id: 2,
          feedId: 2,
          verb: 'event.create',
          groupBy: 'target:agenda:48648353',
          store: {
            actor: ['user:45645613'],
            object: ['event:99798765'],
            target: ['agenda:58648352'],
            labels: {
              actor: 'JP',
              object: "Visite d'OpenAgenda",
              target: 'Visites chez les géants',
            },
          },
          state: 2,
          sent: 0,
        },
        {
          id: 1,
          feedId: 2,
          verb: 'event.create',
          groupBy: 'target:agenda:48648352',
          store: {
            actor: ['user:45645612'],
            object: ['event:98798765'],
            target: ['agenda:48648352'],
            labels: {
              actor: 'Sonny',
              object: 'Réunion des junkies anonymes',
              target: 'Apéro du matin',
            },
          },
          state: 2,
          sent: 0,
        },
      ]));

    it('mark some notifications with ids as seen', () =>
      expect(
        service
          .feed({ entityType: 'user', entityUid: 42 })
          .notifications.markAs({ ids: [2, 3] }, 1)
          .then((notifs) =>
            notifs.map((notif) => {
              expect(notif.createdAt).toBeInstanceOf(Date);
              expect(notif.updatedAt).toBeInstanceOf(Date);
              return _.omit(notif, 'createdAt', 'updatedAt');
            })),
      ).resolves.toMatchObject([
        {
          id: 3,
          feedId: 2,
          verb: 'event.update',
          groupBy: 'target:agenda:48648353',
          store: {
            actor: ['user:45645613'],
            object: ['event:99798765'],
            target: ['agenda:58648352'],
            labels: {
              actor: 'JP',
              object: "Visite d'OpenAgenda",
              target: 'Visites chez les géants',
            },
          },
          state: 1,
          sent: 0,
        },
        {
          id: 2,
          feedId: 2,
          verb: 'event.create',
          groupBy: 'target:agenda:48648353',
          store: {
            actor: ['user:45645613'],
            object: ['event:99798765'],
            target: ['agenda:58648352'],
            labels: {
              actor: 'JP',
              object: "Visite d'OpenAgenda",
              target: 'Visites chez les géants',
            },
          },
          state: 1,
          sent: 0,
        },
      ]));

    it('mark some notifications with ids as seen - with allowRegress option to false', () =>
      expect(
        service
          .feed({ entityType: 'user', entityUid: 42 })
          .notifications.markAs({ ids: [2, 3] }, 1, { allowRegress: false })
          .then((notifs) =>
            notifs.map((notif) => {
              expect(notif.createdAt).toBeInstanceOf(Date);
              expect(notif.updatedAt).toBeInstanceOf(Date);
              return _.omit(notif, 'createdAt', 'updatedAt');
            })),
      ).resolves.toMatchObject([
        {
          id: 3,
          feedId: 2,
          verb: 'event.update',
          groupBy: 'target:agenda:48648353',
          store: {
            actor: ['user:45645613'],
            object: ['event:99798765'],
            target: ['agenda:58648352'],
            labels: {
              actor: 'JP',
              object: "Visite d'OpenAgenda",
              target: 'Visites chez les géants',
            },
          },
          state: 1,
          sent: 0,
        },
        {
          id: 2,
          feedId: 2,
          verb: 'event.create',
          groupBy: 'target:agenda:48648353',
          store: {
            actor: ['user:45645613'],
            object: ['event:99798765'],
            target: ['agenda:58648352'],
            labels: {
              actor: 'JP',
              object: "Visite d'OpenAgenda",
              target: 'Visites chez les géants',
            },
          },
          state: 2,
          sent: 0,
        },
      ]));

    it('mark a notification as read with state in string', () =>
      expect(
        service
          .feed({ entityType: 'user', entityUid: 42 })
          .notifications.markAs(
            { verb: 'event.create', groupBy: 'target:agenda:48648352' },
            'seen',
          )
          .then(([notif]) => {
            expect(notif.createdAt).toBeInstanceOf(Date);
            expect(notif.updatedAt).toBeInstanceOf(Date);
            return _.omit(notif, 'createdAt', 'updatedAt');
          }),
      ).resolves.toMatchObject({
        id: 1,
        feedId: 2,
        verb: 'event.create',
        groupBy: 'target:agenda:48648352',
        store: {
          actor: ['user:45645612'],
          object: ['event:98798765'],
          target: ['agenda:48648352'],
          labels: {
            actor: 'Sonny',
            object: 'Réunion des junkies anonymes',
            target: 'Apéro du matin',
          },
        },
        state: 1,
        sent: 0,
      }));

    it("try to mark a notification that doesn't exist", () =>
      expect(
        service
          .feed({ entityType: 'user', entityUid: 42 })
          .notifications.markAs(
            { verb: 'event.create', groupBy: 'target:agenda:96385274' },
            'seen',
          ),
      ).resolves.toEqual([]));

    it('try to mark a notification with a bad query', async () => {
      const error = await service
        .feed({ entityType: 'user', entityUid: 42 })
        .notifications.markAs(
          { verb: {}, groupBy: 'target:agenda:96385274' },
          'seen',
        )
        .then(
          () => null,
          (e) => e,
        );

      expect(error).toMatchObject({
        message: 'Query validation failed',
        info: {
          errors: [
            {
              field: 'verb',
              code: 'string.invalidtype',
              message: 'not a string',
              origin: {},
            },
          ],
        },
      });
    });
  });

  describe('list', () => {
    it('simple list of notifications of a feed', () =>
      expect(
        service
          .feed({ entityType: 'user', entityUid: 42 })
          .notifications.list()
          .then((notifs) =>
            notifs.map((notif) => {
              expect(notif.createdAt).toBeInstanceOf(Date);
              expect(notif.updatedAt).toBeInstanceOf(Date);
              return _.omit(notif, 'createdAt', 'updatedAt');
            })),
      ).resolves.toMatchObject([
        {
          id: 5,
          feedId: 2,
          verb: 'agenda.changeEventState',
          groupBy: 'target:agenda:66666666|store.newState:2',
          store: {
            actor: ['user:12312312'],
            object: ['event:78978999'],
            target: ['agenda:66666666'],
            labels: {
              actor: 'Jacky',
              object: 'Réunion des junkies anonymes 2',
              target: 'La fumette',
            },
            newState: 2,
          },
          state: 0,
          sent: 0,
        },
        {
          id: 4,
          feedId: 2,
          verb: 'event.update',
          groupBy: 'target:agenda:48648354',
          store: {
            actor: ['user:45645614'],
            object: ['event:99798766'],
            target: ['agenda:58648353'],
            labels: {
              actor: 'Kaore',
              object: "Visite d'OpenAgenda v2",
              target: 'Visites chez les géants du web 2017',
            },
          },
          state: 0,
          sent: 0,
        },
        {
          id: 3,
          feedId: 2,
          verb: 'event.update',
          groupBy: 'target:agenda:48648353',
          store: {
            actor: ['user:45645613'],
            object: ['event:99798765'],
            target: ['agenda:58648352'],
            labels: {
              actor: 'JP',
              object: "Visite d'OpenAgenda",
              target: 'Visites chez les géants',
            },
          },
          state: 0,
          sent: 0,
        },
        {
          id: 2,
          feedId: 2,
          verb: 'event.create',
          groupBy: 'target:agenda:48648353',
          store: {
            actor: ['user:45645613'],
            object: ['event:99798765'],
            target: ['agenda:58648352'],
            labels: {
              actor: 'JP',
              object: "Visite d'OpenAgenda",
              target: 'Visites chez les géants',
            },
          },
          state: 2,
          sent: 0,
        },
        {
          id: 1,
          feedId: 2,
          verb: 'event.create',
          groupBy: 'target:agenda:48648352',
          store: {
            actor: ['user:45645612'],
            object: ['event:98798765'],
            target: ['agenda:48648352'],
            labels: {
              actor: 'Sonny',
              object: 'Réunion des junkies anonymes',
              target: 'Apéro du matin',
            },
          },
          state: 0,
          sent: 0,
        },
      ]));

    it('list with a fromId and a limit', () =>
      expect(
        service
          .feed({ entityType: 'user', entityUid: 42 })
          .notifications.list(/* from id */ 4, 2)
          .then((notifs) =>
            notifs.map((notif) => {
              expect(notif.createdAt).toBeInstanceOf(Date);
              expect(notif.updatedAt).toBeInstanceOf(Date);
              return _.omit(notif, 'createdAt', 'updatedAt');
            })),
      ).resolves.toMatchObject([
        {
          id: 3,
          feedId: 2,
          verb: 'event.update',
          groupBy: 'target:agenda:48648353',
          store: {
            actor: ['user:45645613'],
            object: ['event:99798765'],
            target: ['agenda:58648352'],
            labels: {
              actor: 'JP',
              object: "Visite d'OpenAgenda",
              target: 'Visites chez les géants',
            },
          },
          state: 0,
          sent: 0,
        },
        {
          id: 2,
          feedId: 2,
          verb: 'event.create',
          groupBy: 'target:agenda:48648353',
          store: {
            actor: ['user:45645613'],
            object: ['event:99798765'],
            target: ['agenda:58648352'],
            labels: {
              actor: 'JP',
              object: "Visite d'OpenAgenda",
              target: 'Visites chez les géants',
            },
          },
          state: 2,
          sent: 0,
        },
      ]));

    it('list with a verb in query', () =>
      expect(
        service
          .feed({ entityType: 'user', entityUid: 42 })
          .notifications.list({ verb: 'event.create' })
          .then((notifs) =>
            notifs.map((notif) => {
              expect(notif.createdAt).toBeInstanceOf(Date);
              expect(notif.updatedAt).toBeInstanceOf(Date);
              return _.omit(notif, 'createdAt', 'updatedAt');
            })),
      ).resolves.toMatchObject([
        {
          id: 2,
          feedId: 2,
          verb: 'event.create',
          groupBy: 'target:agenda:48648353',
          store: {
            actor: ['user:45645613'],
            object: ['event:99798765'],
            target: ['agenda:58648352'],
            labels: {
              actor: 'JP',
              object: "Visite d'OpenAgenda",
              target: 'Visites chez les géants',
            },
          },
          state: 2,
          sent: 0,
        },
        {
          id: 1,
          feedId: 2,
          verb: 'event.create',
          groupBy: 'target:agenda:48648352',
          store: {
            actor: ['user:45645612'],
            object: ['event:98798765'],
            target: ['agenda:48648352'],
            labels: {
              actor: 'Sonny',
              object: 'Réunion des junkies anonymes',
              target: 'Apéro du matin',
            },
          },
          state: 0,
          sent: 0,
        },
      ]));
  });

  describe('remove', () => {
    it('remove a notification', () =>
      expect(
        service
          .feed({ entityType: 'user', entityUid: 42 })
          .notifications.remove({
            verb: 'event.create',
            groupBy: 'target:agenda:48648352',
          }),
      ).resolves.toBe(1));

    it('remove some notifications of a feed', () =>
      expect(
        service
          .feed({ entityType: 'user', entityUid: 42 })
          .notifications.remove({ verb: 'event.create' }),
      ).resolves.toBe(2));

    it('remove some notifications with ids', () =>
      expect(
        service
          .feed({ entityType: 'user', entityUid: 42 })
          .notifications.remove({ ids: [2, 3] }),
      ).resolves.toBe(2));

    it("try to remove a notification that doesn't exist", () =>
      expect(
        service
          .feed({ entityType: 'user', entityUid: 42 })
          .notifications.remove({
            verb: 'event.create',
            groupBy: 'target:agenda:96385274',
          }),
      ).resolves.toBe(0));

    it('try to remove a notification with a bad query', async () => {
      const error = await service
        .feed({ entityType: 'user', entityUid: 42 })
        .notifications.remove({ verb: {}, groupBy: 'target:agenda:96385274' })
        .then(
          () => null,
          (e) => e,
        );

      expect(error).toMatchObject({
        message: 'Query validation failed',
        info: {
          errors: [
            {
              field: 'verb',
              code: 'string.invalidtype',
              message: 'not a string',
              origin: {},
            },
          ],
        },
      });
    });
  });
});
