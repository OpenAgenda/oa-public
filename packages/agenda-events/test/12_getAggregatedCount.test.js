import knex from 'knex';
import Service from '../index.js';
import config from '../testconfig.js';
import fixtures from './fixtures/index.js';

describe('agendaEvents - 12 - functional (server): getAggregatedCount', () => {
  let svc;
  let knexClient;

  beforeAll(async () => {
    await fixtures(config.mysql, [
      'reset.sql',
      '../../model.sql',
      'agenda_event_with_aggregated.data.sql',
    ]);

    knexClient = knex({
      client: 'mysql2',
      connection: config.mysql,
    });

    const aMonthAgo = new Date();
    aMonthAgo.setMonth(aMonthAgo.getMonth() - 1);

    await knexClient.raw('update agenda_event set created_at=? where id <> ?', [
      aMonthAgo,
      5,
    ]);

    svc = Service({
      ...config,
      knex: knexClient,
    });
  });

  afterAll(() => knexClient.destroy());

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
