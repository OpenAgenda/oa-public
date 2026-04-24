import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { service as config } from '../testconfig.js';

import Service from '../index.js';
import setup from './fixtures/setup.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('events - functional - countByLocationUids', () => {
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
      imagePath: config.imagePath,
      defaultImage: '//default/image/path.png',
    });
  });

  afterAll(() => knex?.destroy());

  describe('simple count', () => {
    let counts;

    beforeAll(async () => {
      counts = await svc.countByLocationUids(
        { locationUid: [34342835, 4395371, 43953713] },
        { private: false },
      );
    });

    it('lists 20 items by default', () => {
      expect(counts.length).toBe(2);
    });
  });
});
