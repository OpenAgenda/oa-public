import config from '../testconfig.js';
import createInstance from '../index.js';
import { Tracker } from './utils.js';
import fixtures from './fixtures/index.js';

describe('10 - remove', () => {
  const f = fixtures(config.mysql);
  let svc;
  const tracker = Tracker();

  beforeAll(async () => {
    await f.load([
      'reset.sql',
      '../../model.sql',
      'aggregator.data.json',
      'review.create.sql',
      'review.data.json',
    ]);

    svc = createInstance({
      knex: f.client,
      queue: {
        add: tracker('register'),
      },
      createWorker: () => ({
        on: tracker('on'),
      }),
      interfaces: {},
    });
  });

  afterAll(f.destroyClient);

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
