import _ from 'lodash';
import knex from 'knex';
import redis from 'redis';
import Queues from '@openagenda/queues';
import Service from '../index.js';
import config from '../testconfig.js';
import fixtures from './fixtures/index.js';
import membersFixtures from './fixtures/members.json';
import sourceAgendasFixtures from './fixtures/sourceAgendas.json';

describe('agendaEvents - functional (server): listAllRemoved', () => {
  let svc;
  let redisClient;
  let knexClient;

  beforeAll(async () => {
    await fixtures(config.mysql, [
      'reset.sql',
      '../../model.sql',
      'agenda_event_with_removed.data.sql',
    ]);
  });

  beforeAll(async () => {
    redisClient = redis.createClient({
      socket: { host: 'localhost', port: 6379 },
    });

    await redisClient.connect();

    knexClient = knex({
      client: 'mysql',
      connection: config.mysql,
    });
  });

  beforeAll(() => {
    svc = Service({
      ...config,
      knex: knexClient,
      queue: Queues({
        redis: redisClient,
        prefix: 'agenda-events',
      })('listAllRemoved'),
      interfaces: {
        ...config.interfaces,
        getMembers: async (aes) =>
          aes
            .map(({ agendaUid, userUid }) =>
              _.find(membersFixtures, {
                agendaUid,
                userUid,
              }))
            .filter((ae) => !!ae),
        getSourceAgendas: async (sourceAgendaUids) =>
          sourceAgendasFixtures.filter(({ uid }) =>
            sourceAgendaUids.includes(uid)),
      },
    });
  });

  afterAll(async () => redisClient.quit());
  afterAll(() => knexClient.destroy());

  it('simple list all removed', async () => {
    const result = await svc.list.allRemoved(0, 10);

    expect(Object.keys(result)).toEqual(['items', 'total']);
    expect(result.total).toBe(2);
    expect(
      result.items[0].agendaUid !== result.items[1].agendaUid,
    ).toBeTruthy();
  });

  it('with updatedAt query', async () => {
    const result = await svc.list.allRemoved(
      {
        updatedAt: { gte: '2020-01-01' },
      },
      0,
      10,
    );

    expect(Object.keys(result)).toEqual(['items', 'total']);
    expect(result.total).toBe(1);
    expect(
      new Date(result.items[0].updatedAt).getTime(),
    ).toBeGreaterThanOrEqual(new Date('2020-01-01').getTime());
  });
});
