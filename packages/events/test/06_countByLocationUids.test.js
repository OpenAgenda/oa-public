import { service as config } from '../testconfig.js';

import Service from '../index.js';
import fixtures from './fixtures/index.js';

describe('events - functional - countByLocationUids', () => {
  const f = fixtures(config.mysql, config.schema);

  let svc;

  beforeAll(async () => {
    await f.load();

    svc = Service({
      knex: f.client,
      imagePath: config.imagePath,
      defaultImage: '//default/image/path.png',
    });
  });

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
