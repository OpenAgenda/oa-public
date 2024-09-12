import _ from 'lodash';
import ih from 'immutability-helper';
import redis from 'redis';
import knex from 'knex';
import Queues from '@openagenda/queues';
import Service from '../index.js';
import config from '../testconfig.js';
import fixtures from './fixtures/index.js';

describe('agendaEvents - 05 - functional (server): remove', () => {
  let svc;
  let redisClient;
  let knexClient;

  beforeEach(async () => {
    await fixtures(config.mysql, [
      'reset.sql',
      '../../model.sql',
      'agenda_event.data.sql',
    ]);
  });

  beforeAll(async () => {
    knexClient = knex({
      client: 'mysql',
      connection: config.mysql,
    });
  });

  beforeAll(async () => {
    redisClient = redis.createClient({
      socket: { host: 'localhost', port: 6379 },
    });

    await redisClient.connect();
  });

  beforeEach(() => {
    svc = Service({
      ...config,
      knex: knexClient,
    });
  });

  afterAll(async () => redisClient.quit());
  afterAll(() => knexClient.destroy());

  it('simple remove', async () => {
    const before = await svc(62792452).get(10974548);
    const result = await svc(62792452).remove(10974548);
    const after = await svc(62792452).get(10974548, { removed: null });

    expect(result.success).toBe(true);

    expect(before).not.toBeNull();

    expect(after.removed).toBeTruthy();

    expect(_.pick(result.removed, ['eventUid', 'agendaUid'])).toEqual({
      eventUid: 10974548,
      agendaUid: 62792452,
    });
  });

  it('remove by legacyId', async () => {
    const before = await svc(62792452).get(10974548);
    const result = await svc.remove.byLegacyId(42, 24);
    const after = await svc(62792452).get(10974548, { removed: null });

    expect(result.success).toBe(true);
    expect(before).not.toBeNull();
    expect(after.removed).toBeTruthy();
  });

  it('remove by legacyId with eventId only', async () => {
    const before = await svc(62792452).get(10974548);
    const result = await svc.remove.byLegacyId(null, 24);
    const after = await svc(62792452).get(10974548, { removed: null });

    expect(result.success).toBe(true);
    expect(before).not.toBeNull();
    expect(after.removed).toBeTruthy();
  });

  it('all references of given event can be removed in one call', async () => {
    const result = await svc.remove(15205357);

    expect(result).toEqual({
      success: true,
      removed: 2,
    });
  });

  it('when several references are removed', () =>
    new Promise((rs) => {
      let count = 0;

      const queue = Queues({
        redis: redisClient,
        prefix: 'agenda-events',
      })('05_remove');

      const svc2 = Service({
        ...config,
        queue,
        interfaces: {
          onRemove: (removed) => {
            count += 1;

            expect(removed.eventUid).toEqual(15205357);

            if (count === 2) {
              rs();
            }
          },
        },
      });

      svc2.remove(15205357);

      queue.run();
    }));

  it('context can be passed in options to be transfered to onRemove interface', () =>
    new Promise((rs) => {
      const svc2 = Service(
        ih(config, {
          interfaces: {
            onRemove: {
              $set: (removed, context) => {
                expect(context.userUid).toEqual(111);

                rs();
              },
            },
          },
        }),
      );

      svc2(62792452).remove(10974548, {
        context: {
          userUid: 111,
        },
      });
    }));
});
