'use strict';

process.env.NODE_ENV = 'test';

const Files = require('@openagenda/files');

const testConfig = require('../testconfig');

const { service: config, dependencies: dConfig } = testConfig;

const svc = require('../service');

const loadFixtures = require('./fixtures/load');

describe('agendas - functional (server): list', () => {
  beforeAll(
    loadFixtures.bind(null, {
      mysql: config.mysql,
      files: [
        `${__dirname}/fixtures/resetDb.sql`,
        `${__dirname}/../model.sql`,
        `${__dirname}/fixtures/agenda.data.sql`,
        `${__dirname}/fixtures/agendaEvent.data.sql`,
        `${__dirname}/fixtures/stakeholder.data.sql`,
      ],
      map: {
        database: config.mysql.database,
        agenda: 'agenda',
        agendaEvent: 'agenda_event',
        stakeholder: 'stakeholder',
      },
    }),
  );

  beforeAll(() => {
    svc.init({
      ...config,
      Files: Files(dConfig.files),
    });
  });

  it('list as a promise', async () => {
    const { agendas } = await svc.list(0, 10);

    expect(agendas.length).toEqual(10);
  });

  it('list with offset gets right agenda', async () => {
    const { agendas } = await svc.list(0, 10, { internal: true });
    const { agendas: offsetAgendas } = await svc.list({}, 4, 1, {
      internal: true,
    });

    expect(agendas.length).toEqual(10);
    expect(offsetAgendas.length).toEqual(1);
    expect(agendas[4].id).toEqual(offsetAgendas[0].id);
  });

  it('list with { offsetAsLastId } option allows for using id value as offset base', async () => {
    const { agendas } = await svc.list({}, 4890, 1, {
      offsetAsLastId: true,
      internal: true,
    });

    expect(agendas[0].id).toEqual(4892);
  });

  it('list with { offsetAsLastId } and { order: id.desc } option allows for using id value as offset in reverse id order', async () => {
    const { agendas } = await svc.list(
      {
        order: 'id.desc',
      },
      4890,
      1,
      {
        offsetAsLastId: true,
        internal: true,
      },
    );

    expect(agendas[0].id).toEqual(4889);
  });

  it('list with { offsetAsLastId } provides lastId key in result', async () => {
    const { lastId } = await svc.list({}, 4890, 1, {
      offsetAsLastId: true,
      internal: true,
    });

    expect(lastId).toEqual(4892);
  });

  it('list with { internal: false } does not include internal fields', async () => {
    const { agendas } = await svc.list({}, 0, 1, {
      internal: false,
    });

    expect(Object.keys(agendas[0])).toEqual([
      'locationSetUid',
      'slug',
      'uid',
      'official',
      'title',
      'description',
      'url',
      'image',
      'updatedAt',
      'createdAt',
      'private',
      'indexed',
    ]);
  });

  it('list with includeImagePath includes full image path', async () => {
    const { agendas } = await svc.list({}, 0, 1, {
      includeImagePath: true,
    });

    expect(agendas[0].image).toEqual(
      'https://cdn.openagenda.com/dev/review_sylvie-et-pascal-verger_00.jpg',
    );
  });

  it('onlyIncludeFields option', async () => {
    const { agendas } = await svc.list({}, 0, 1, {
      onlyIncludeFields: ['uid'],
    });

    expect(Object.keys(agendas[0])).toEqual(['uid']);
  });

  it('default list does not return private agendas', async () => {
    const { agendas } = await svc.list(85, 10);

    // this agenda is private
    expect(agendas.filter((a) => a.uid === 54289989).length).toEqual(0);

    // these aren't
    expect(agendas.filter((a) => a.uid === 24821824).length).toEqual(1);
    expect(agendas.filter((a) => a.uid === 17582566).length).toEqual(1);

    expect(agendas.length).toEqual(10);
  });

  it('default list returns unindexed agendas', async () => {
    const { agendas } = await svc.list(0, 30);

    expect(agendas.filter((a) => a.uid === 90695263).length).toEqual(1);
  });

  it('list with indexed option set to true does not return unindexed agendas', async () => {
    const { agendas } = await svc.list(0, 30, { indexed: true });

    expect(agendas.filter((a) => a.uid === 90695263).length).toEqual(0);
  });

  it('total option at true provides total in result', async () => {
    const { total } = await svc.list(0, 30, { total: true });

    expect(total).toEqual(97);
  });

  it('list with empty ids returns empty list', async () => {
    const { agendas } = await svc.list({ ids: [] }, 0, 10);

    expect(agendas.length).toEqual(0);
  });

  it('list with ids gets agendas', async () => {
    const { agendas } = await svc.list({ ids: [4829, 4848] }, 0, 2);

    expect(agendas.length).toEqual(2);
  });

  it('list by uids', async () => {
    const { agendas } = await svc.list(
      {
        uid: 17582566,
      },
      0,
      1,
    );

    expect(agendas.length).toBe(1);
    expect(agendas[0].uid).toBe(17582566);
  });

  it('list by slugs', async () => {
    const { agendas } = await svc.list(
      {
        slug: 'inaregions',
      },
      0,
      1,
    );

    expect(agendas.length).toBe(1);
    expect(agendas[0].slug).toBe('inaregions');
  });

  it('list by user', async () => {
    const { agendas } = await svc.list({
      memberUserUid: 12345678,
    });

    expect(agendas.length).toBe(2);
    expect(agendas[0].slug).toBe('inagrm');
    expect(agendas[1].slug).toBe('inaregions');
  });

  it('DEPRECATE - list with ids and search gets agendas', async () => {
    const { agendas } = await svc.list(
      { ids: [4828, 4848], private: null, search: 'gradignan' },
      0,
      2,
    );

    expect(agendas.length).toEqual(1);
  });

  it('list with ids and search gets agendas', async () => {
    const { agendas } = await svc.list(
      { ids: [4828, 4848], search: 'gradignan' },
      0,
      2,
      { private: null },
    );

    expect(agendas.length).toEqual(1);
  });

  it('list with idGreaterThan limits agendas which have an id greater than a given id', async () => {
    const { agendas } = await svc.list({ idGreaterThan: 4930 }, 0, 10, {
      internal: true,
    });

    agendas
      .map((a) => a.id)
      .forEach((id) => {
        expect(id > 4930).toEqual(true);
      });
  });

  it('list with updatedAtGreaterThan limits agendas to those updated after a given timestamp', async () => {
    const { agendas } = await svc.list(
      {
        updatedAtGreaterThan: new Date('2016-01-29T07:55:09.000Z'),
      },
      0,
      10,
      { private: null },
    );

    agendas.forEach((a) => {
      expect(a.updatedAt > new Date('2016-01-29T07:55:09.000Z')).toEqual(true);
    });
  });

  it('list with credentials', async () => {
    const { agendas } = await svc.list(
      {
        credentials: {
          moderators: true,
          docxExport: false,
        },
      },
      0,
      10,
      { private: null, includeFields: ['credentials'] },
    );

    expect(agendas.length).toBe(1);
  });

  it('list ordered by createdAt.desc gets newest agenda listed first', async () => {
    const { agendas } = await svc.list({ order: 'createdAt.desc' }, 0, 10);

    let prevCreatedAt = agendas[0].createdAt;

    agendas.forEach((a) => {
      expect(a.createdAt.getTime()).toBeLessThanOrEqual(
        prevCreatedAt.getTime(),
      );

      prevCreatedAt = a.createdAt;
    });
  });

  it('list ordered by updatedAt.desc gets latest agendas listed first', async () => {
    const { agendas } = await svc.list({ order: 'updatedAt.desc' }, 0, 10);

    let prevUpdatedAt = agendas[0].updatedAt;

    agendas.forEach((a) => {
      expect(a.updatedAt.getTime()).toBeLessThanOrEqual(
        prevUpdatedAt.getTime(),
      );

      prevUpdatedAt = a.updatedAt;
    });
  });

  it('a few lists do not leak db connections', async () => {
    let remaining = 400;

    while (remaining > 0) {
      await svc.list(0, 10);
      remaining -= 1;
    }

    expect(remaining).toEqual(0);
  });
});
