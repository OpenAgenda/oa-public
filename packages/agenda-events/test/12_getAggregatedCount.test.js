import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import Service from '../index.js';
import config from '../testconfig.js';
import setup from './fixtures/setup.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('agendaEvents - 12 - functional (server): getAggregatedCount', () => {
  let knex;
  let svc;

  beforeAll(async () => {
    knex = await setup({
      mysql: config.mysql,
      schemas: config.schemas,
      data: [`${__dirname}/fixtures/agenda_event_with_aggregated.data.sql`],
    });

    const aMonthAgo = new Date();
    aMonthAgo.setMonth(aMonthAgo.getMonth() - 1);

    await knex.raw('update agenda_event set created_at=? where id <> ?', [
      aMonthAgo,
      5,
    ]);

    svc = Service({
      ...config,
      knex,
    });
  });

  afterAll(() => knex?.destroy());

  it('should count aggregated only, for agenda only, after a year ago by default', async () => {
    const count = await svc(62792452).getAggregatedCount();
    expect(count).toBe(2);
  });

  it('a different since can be specified', async () => {
    const count = await svc(62792452).getAggregatedCount(
      new Date('2015-01-01'),
    );
    expect(count).toBe(3);
  });
});
