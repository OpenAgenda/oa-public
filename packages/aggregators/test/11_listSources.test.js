'use strict';

const createInstance = require('..');
const config = require('../testconfig');
const fixtures = require('./fixtures');
const getAgendasByUids = require('./fixtures/getAgendasByUids');

describe('11 - list sources', () => {
  const agenda = { id: 218 };

  const f = fixtures(config.mysql);
  let svc;

  beforeAll(async () => {
    await f.load([
      'reset.sql',
      '../../model.sql',
      'aggregator.data.json',
      'review.create.sql',
      'review.data.json',
      'aggregator_source.data.json',
    ]);

    svc = createInstance({
      knex: f.client,
      queues: () => Object.assign(async () => {}, {
        register: () => {},
        on: () => {},
      }),
      interfaces: {
        getAgendasByUids,
      },
    });
  });

  afterAll(f.destroyClient);

  test('unfiltered list', async () => {
    const sources = await svc.sources.list(agenda);

    expect(sources.map(s => s.agendaUid)).toEqual([222, 333, 444]);
  });

  test('filtered list', async () => {
    const sources = await svc.sources.list(agenda, { search: 'Martinique' });

    expect(sources.map(s => s.agendaUid)).toEqual([333]);
  });

  test('filtered list by slug', async () => {
    const sources = await svc.sources.list(agenda, { slug: 'fds-martinique' });

    expect(sources.map(s => s.agendaUid)).toEqual([333]);
  });

  test('list cleans rules before returning them', async () => {
    const sources = await svc.sources.list(agenda, 'Guadeloupe');

    expect(sources[0].rules).toEqual([
      {
        query: {},
        actions: [
          {
            field: 'state',
            values: { $set: 2 },
          },
        ],
        required: false,
      },
    ]);
  });
});
