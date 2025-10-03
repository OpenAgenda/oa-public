import _ from 'lodash';
import knex from 'knex';
import Service from '../index.js';
import config from '../testconfig.js';
import fixtures from './fixtures/index.js';
import membersFixtures from './fixtures/members.json';
import sourceAgendasFixtures from './fixtures/sourceAgendas.json';

describe('agendaEvents - functional (server): listRemoved', () => {
  let svc;
  let knexClient;

  beforeAll(async () => {
    await fixtures(config.mysql, [
      'reset.sql',
      '../../model.sql',
      'agenda_event_with_removed.data.sql',
    ]);
  });

  beforeAll(async () => {
    knexClient = knex({
      client: 'mysql2',
      connection: config.mysql,
    });
  });

  beforeAll(() => {
    svc = Service({
      ...config,
      knex: knexClient,
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

  afterAll(() => knexClient.destroy());

  it('simple list all removed', async () => {
    const result = await svc.list.removed(0, 10);

    expect(Object.keys(result)).toEqual(['items', 'total']);
    expect(result.total).toBe(2);
    expect(
      result.items[0].agendaUid !== result.items[1].agendaUid,
    ).toBeTruthy();
  });

  it('with updatedAt query', async () => {
    const result = await svc.list.removed(
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
