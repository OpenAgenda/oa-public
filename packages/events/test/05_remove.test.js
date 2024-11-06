import { service as config } from '../testconfig.sample.js';
import Service from '../index.js';
import fixtures from './fixtures/index.js';

describe('events - functional - remove', () => {
  const f = fixtures(config.mysql, config.schema);

  let svc;

  beforeAll(async () => {
    await f.load();

    svc = Service({
      knex: f.client,
    });
  });

  describe('simple remove', () => {
    let removed;

    beforeAll(async () => {
      removed = await svc.remove(16687899);
    });

    it('response is removed event', () => {
      expect(removed.uid).toBe(16687899);
    });

    it('remove is a soft delete', async () => {
      const deletedAt = await f
        .client('event_2')
        .first(['deleted_at'])
        .where('uid', removed.uid)
        .then((r) => r.deleted_at);

      expect(deletedAt).toBeInstanceOf(Date);
    });
  });

  describe('interfaces', () => {
    const calls = [];

    beforeAll(async () => {
      await f.load();

      svc = Service({
        knex: f.client,
        interfaces: {
          beforeRemove: Object.assign(
            (removed, context, cb) => {
              setTimeout(() => {
                calls.push(['beforeRemove', removed, context]);
                cb();
              }, 100);
            },
            {
              callback: true,
            },
          ),
          onRemove: async (removed, context) => {
            calls.push(['onRemove', removed, context]);
          },
        },
      });

      await svc.remove(93469090, { context: 'Remove context' });
    });

    it('beforeRemove was called, when cb is provided in interface function it is called', () => {
      expect(calls[0][0]).toBe('beforeRemove');
    });

    it('onRemove was called', () => {
      expect(calls[1][0]).toBe('onRemove');
    });
  });

  describe('other', () => {
    it('private event can be removed if private option is set', async () => {
      const removed = await svc.remove(51999554, { private: null });

      expect(removed.uid).toBe(51999554);
    });
  });
});
