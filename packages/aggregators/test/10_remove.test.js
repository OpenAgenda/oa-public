import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import config from '../testconfig.js';
import createInstance from '../index.js';
import { Tracker } from './utils.js';
import setup from './fixtures/setup.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('10 - remove', () => {
  let knex;
  let svc;
  const tracker = Tracker();

  beforeAll(async () => {
    knex = await setup({
      mysql: config.mysql,
      schemas: config.schemas,
      data: [
        `${__dirname}/fixtures/review.data.sql`,
        `${__dirname}/fixtures/aggregator.data.sql`,
      ],
    });

    svc = createInstance({
      knex,
      queue: {
        add: tracker('register'),
      },
      createWorker: () => ({
        on: tracker('on'),
      }),
      interfaces: {},
    });
  });

  afterAll(() => knex?.destroy());

  test('remove is successful', async () => {
    const result = await svc.remove(999);
    expect(result.success).toBe(true);
  });

  test('error is thrown if aggregator to be removed is not found', async () => {
    let err;
    try {
      await svc.remove(92929);
    } catch (e) {
      err = e;
    }

    expect(err.message).toBe('Aggregator not found');
  });
});
