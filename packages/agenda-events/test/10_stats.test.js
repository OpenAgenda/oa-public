import knex from 'knex';

import Service from '../index.js';
import config from '../testconfig.js';
import fixtures from './fixtures/index.js';

describe('agendaEvents - functional (server): stats', () => {
  let svc;
  let knexClient;

  beforeAll(async () => {
    await fixtures(config.mysql, [
      'reset.sql',
      '../../model.sql',
      'agenda_event.data.sql',
    ]);
  });

  beforeAll(async () => {
    knexClient = knex({
      client: 'mysql2',
      connection: config.mysql,
    });
  });

  beforeAll(() => {
    svc = Service({
      ...config,
      knex: knexClient,
    });
  });

  afterAll(() => knexClient.destroy());

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
