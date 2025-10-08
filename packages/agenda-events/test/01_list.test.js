import _ from 'lodash';
import knex from 'knex';
import Service from '../index.js';
import config from '../testconfig.js';
import states from '../iso/states.js';
import fixtures from './fixtures/index.js';
import membersFixtures from './fixtures/members.json';
import sourceAgendasFixtures from './fixtures/sourceAgendas.json';

describe('agendaEvents - 01 - functional (server): list', () => {
  let svc;
  let knexClient;

  beforeAll(async () => {
    await fixtures(config.mysql, [
      'reset.sql',
      '../../model.sql',
      'agenda_event.data.sql',
    ]);
  });

  beforeAll(async () => {
    knexClient = knex({
      client: 'mysql2',
      connection: { ...config.mysql },
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

  it('simple list', async () => {
    const result = await svc(62792452).list(100, 10);

    expect(Object.keys(result)).toEqual(['items', 'total']);
  });

  it('list with member decorate provides members for each returned item', async () => {
    const { items } = await svc(62792452).list(100, 10, {
      decorate: ['member'],
    });

    expect(items.filter(({ member }) => member).length).toBe(4);

    expect(items.filter(({ member }) => member)[0].member).toEqual({
      agendaUid: 62792452,
      userUid: 123,
      role: 2,
    });
  });

  it('list with sourceAgendas decorate provides source agendas for each returned item', async () => {
    const { items } = await svc(62792452).list(100, 10, {
      decorate: ['sourceAgendas'],
    });

    expect(items[0].sourceAgendas).toEqual([
      { uid: 7878876, title: 'Papadapap' },
      { uid: 789679, title: 'Castoche' },
    ]);

    expect(items[7].sourceAgendas).toEqual([
      {
        uid: 5675765,
        title: 'Dièse',
      },
    ]);
  });

  it('list provides motive on detailed call', async () => {
    const { items } = await svc(62792452).list(
      { state: states.REFUSED },
      0,
      10,
    );

    expect(items.find((ae) => ae.eventUid === 22175636).motive).toBe(
      '╚(ಠ_ಠ)=┐',
    );
  });

  it('list filtered by state using code in query', async () => {
    const result = await svc(62792452).list(
      {
        state: states.PUBLISHED,
      },
      0,
      10,
    );

    expect(result.total).toBe(2);
  });

  it('query can be omitted', async () => {
    const result = await svc(62792452).list(0, 10);

    expect(result.items.length).toBe(10);
  });

  it('list filtered by state using string in query', async () => {
    const result = await svc(62792452).list(
      {
        state: 'published',
      },
      0,
      10,
    );

    expect(result.total).toBe(2);
  });

  it('list filtered by aggregated boolean', async () => {
    const result = await svc(62792452).list({ aggregated: false }, 0, 0);

    expect(result.total).toBe(2);
  });

  it('total gives an integer equal to the total number of items', async () => {
    const result = await svc(62792452).list(100, 10);

    expect(result.total).toBe(2288);
  });

  it('list for several event uids', async () => {
    const result = await svc(62792452).list({
      eventUid: [54434612, 28028226],
    });

    expect(result.items.length).toBe(2);
  });

  it('filter on canEdit', async () => {
    const canEditItems = await svc(62792452)
      .list(
        {
          canEdit: true,
        },
        0,
        1,
      )
      .then(({ items }) => items);

    const cannotEditItems = await svc(62792452)
      .list(
        {
          canEdit: false,
        },
        0,
        1,
      )
      .then(({ items }) => items);

    const eitherItems = await svc(62792452)
      .list({
        eventUid: [canEditItems[0].eventUid, cannotEditItems[0].eventUid],
      })
      .then(({ items }) => items);

    expect(canEditItems[0].canEdit).toBe(true);
    expect(cannotEditItems[0].canEdit).toBe(false);
    expect(eitherItems.length).toBe(2);
  });

  it('listByLastId for faster list', async () => {
    const result = await svc(62792452).listByLastId(0, 10);

    expect(result.items.length).toBe(10);

    const { lastId } = result;

    const next = await svc(62792452).listByLastId(lastId, 10);

    expect(lastId).toBe(469723);
    expect(next.lastId).toBe(511694);
  });

  it('list by event uid', async () => {
    const { items } = await svc.list.byEventUid(54434612, 0, 20);

    expect(items.length).toBe(1);
  });

  it('fix: aggregated is true if is referenced as such in db', async () => {
    const { items } = await svc.list.byEventUid(60059313, 0, 20);
    expect(items[0].aggregated).toBe('1');
  });

  it('list by event uids', async () => {
    const { total } = await svc.list.byEventUid([54434612, 28028226], 0, 20);
    expect(total).toBe(2);
  });

  it('list by event uid and filtering out agenda uid from results', async () => {
    const { items } = await svc.list.byEventUid(
      54434612,
      { excludeAgendaUid: 62792452 },
      0,
      1,
    );

    expect(items.length).toBe(0);
  });

  it('list by event uid and filtering by canEdit', async () => {
    const { items } = await svc.list.byEventUid(54434612, { canEdit: true });
    expect(items.length).toBe(0);
  });

  it('updatedAt timestamp is in result of list', async () => {
    const { items } = await svc(62792452).list();
    expect(items[0].updatedAt instanceof Date).toBe(true);
  });

  it('an item contains agenda & event references, state, featured bool and custom data', async () => {
    const result = await svc(62792452).list(0, 1);

    expect(Object.keys(result.items[0])).toEqual([
      'eventUid',
      'agendaUid',
      'userUid',
      'aggregated',
      'sourcePaths',
      'featured',
      'canEdit',
      'state',
      'createdAt',
      'updatedAt',
      'motive',
    ]);
  });

  it('list only removed items', async () => {
    const { items, total } = await svc(62792452).list(0, 100, {
      removed: true,
    });
    expect(items.length).toBe(1);
    expect(total).toBe(1);
  });

  it('list all items', async () => {
    const { items } = await svc(62792452).list(0, 100, { removed: null });
    expect(items.filter((i) => i.removed === true).length).toBe(1);
    expect(items.length > 1).toBeTruthy();
  });

  it('list only not removed items', async () => {
    const { items } = await svc(62792452).list(0, 10000, {});
    expect(items.filter((i) => i.eventUid === 53117384).length).toBe(0);
    expect(items.length < 10000).toBeTruthy();
  });
});
