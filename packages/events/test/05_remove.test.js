import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { service as config } from '../testconfig.js';
import Service from '../index.js';
import setup from './fixtures/setup.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('events - functional - remove', () => {
  let knex;
  let svc;

  beforeAll(async () => {
    knex = await setup({
      mysql: config.mysql,
      schemas: { eventService: config.schema },
      data: [`${__dirname}/fixtures/event.data.sql`],
    });

    svc = Service({
      knex,
    });
  });

  afterAll(() => knex?.destroy());

  describe('simple remove', () => {
    let removed;

    beforeAll(async () => {
      removed = await svc.remove(16687899);
    });

    it('response is removed event', () => {
      expect(removed.uid).toBe(16687899);
    });

    it('remove is a soft delete', async () => {
      const deletedAt = await knex('event_2')
        .first(['deleted_at'])
        .where('uid', removed.uid)
        .then((r) => r.deleted_at);

      expect(deletedAt).toBeInstanceOf(Date);
    });
  });

  describe('interfaces', () => {
    const calls = [];

    beforeAll(async () => {
      svc = Service({
        knex,
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
