'use strict';

const should = require('should');
const config = require('../config.test');
const createInstance = require('../').createInstance;
const fixtures = require('./fixtures');
const getAgendasByUidsAndSearch = require('./fixtures/getAgendasByUidsAndSearch');

describe('Aggregators list sources', () => {
  const agenda = { id: 218 };

  const f = fixtures(config.mysql);
  let svc;

  before(async () => {
    await f.load();

    svc = createInstance({
      knex: f.client,
      queues: queueName => Object.assign(async () => {}, {
        register: () => {},
        on: () => {}
      }),
      interfaces: {
        getAgendasByUidsAndSearch
      }
    });
  });

  after(f.destroyClient);

  it('unfiltered list', async () => {
    const sources = await svc.sources.list(agenda);

    sources.map(s => s.agendaUid).should.eql([222, 333, 444]);
  });

  it('filtered list', async () => {
    const sources = await svc.sources.list(agenda, 'Martinique');

    sources.map(s => s.agendaUid).should.eql([333]);
  });

  it('list cleans rules before returning them', async () => {
    const sources = await svc.sources.list(agenda, 'Guadeloupe');

    sources[0].rules.should.eql([{
      query: {},
      actions: [{
        state: { '$set': 2 }
      }],
      required: false
    }]);
  });
});
