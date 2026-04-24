import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import config from '../testconfig.js';
import createInstance from '../index.js';
import setup from './fixtures/setup.js';
import getAgendasByUids from './fixtures/getAgendasByUids.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('11 - list sources', () => {
  const agenda = { id: 218 };

  let knex;
  let svc;

  beforeAll(async () => {
    knex = await setup({
      mysql: config.mysql,
      schemas: config.schemas,
      data: [
        `${__dirname}/fixtures/review.data.sql`,
        `${__dirname}/fixtures/aggregator.data.sql`,
        `${__dirname}/fixtures/aggregator_source.data.sql`,
      ],
    });

    svc = createInstance({
      knex,
      queue: {
        add: () => {},
      },
      createWorker: () => ({
        on: () => {},
      }),
      interfaces: {
        getAgendasByUids,
      },
    });
  });

  afterAll(() => knex?.destroy());

  test('unfiltered list', async () => {
    const { sources } = await svc.sources.list(agenda);

    expect(sources.map((s) => s.agenda.uid)).toEqual([222, 333, 444]);
  });

  test('filtered list', async () => {
    const { sources } = await svc.sources.list(agenda, {
      search: 'Martinique',
    });

    expect(sources.map((s) => s.agenda.uid)).toEqual([333]);
  });

  test('filtered list by slug', async () => {
    const { sources } = await svc.sources.list(agenda, {
      slug: 'fds-martinique',
    });

    expect(sources.map((s) => s.agenda.uid)).toEqual([333]);
  });

  test('list cleans rules before returning them', async () => {
    const { sources } = await svc.sources.list(agenda, 'Guadeloupe');

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
