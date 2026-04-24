import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

import Service from '../index.js';
import config from '../testconfig.js';
import setup from './fixtures/setup.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('agendaEvents - functional (server): stats', () => {
  let knex;
  let svc;

  beforeAll(async () => {
    knex = await setup({
      mysql: config.mysql,
      schemas: config.schemas,
      data: [`${__dirname}/fixtures/agenda_event.data.sql`],
    });

    svc = Service({
      ...config,
      knex,
    });
  });

  afterAll(() => knex?.destroy());

  it('countByUserUid (unrestricted)', async () => {
    const counts = await svc(62792452).stats.countByUserUid();

    expect(counts).toEqual([
      {
        count: 2283,
        userUid: null,
      },
      {
        count: 2,
        userUid: 123,
      },
      {
        count: 2,
        userUid: 456,
      },
      {
        count: 1,
        userUid: 12312312,
      },
    ]);
  });

  it('countByUserUid (for specific user uids)', async () => {
    const counts = await svc(62792452).stats.countByUserUid([12312312]);

    expect(counts).toEqual([
      {
        count: 1,
        userUid: 12312312,
      },
    ]);
  });
});
