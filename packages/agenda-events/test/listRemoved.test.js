import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import _ from 'lodash';
import Service from '../index.js';
import config from '../testconfig.js';
import setup from './fixtures/setup.js';
import membersFixtures from './fixtures/members.json' with { type: 'json' };
import sourceAgendasFixtures from './fixtures/sourceAgendas.json' with { type: 'json' };

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('agendaEvents - functional (server): listRemoved', () => {
  let knex;
  let svc;

  beforeAll(async () => {
    knex = await setup({
      mysql: config.mysql,
      schemas: config.schemas,
      data: [`${__dirname}/fixtures/agenda_event_with_removed.data.sql`],
    });

    svc = Service({
      ...config,
      knex,
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

  afterAll(() => knex?.destroy());

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
