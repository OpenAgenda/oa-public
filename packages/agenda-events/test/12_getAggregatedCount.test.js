'use strict';

const Service = require('..');
const config = require('../testconfig');

const fixtures = require('./fixtures');

describe('agendaEvents - 12 - functional (server): getAggregatedCount', function() {
  let svc;

  beforeAll(async () => {
    const fx = await fixtures(config.mysql, [
      'reset.sql',
      '../../model.sql',
      'agenda_event_with_aggregated.data.sql'
    ]);

    const aMonthAgo = new Date();
    aMonthAgo.setMonth(aMonthAgo.getMonth()-1);

    await fx.query(`update agenda_event set created_at=? where id <> ?`, [aMonthAgo, 5]);

    svc = Service(config);
  });

  it('should count aggregated only, for agenda only, after a year ago by default', async () => {
    const count = await svc(62792452).getAggregatedCount();
    expect(count).toBe(2);
  });

  it('a different since can be specified', async () => {
    const count = await svc(62792452).getAggregatedCount(new Date('2015-01-01'));
    expect(count).toBe(3);
  });
});
