'use strict';

const assert = require('assert');
const config = require('./config');
const Service = require('../service');
const listInterface = require('./app/listInterface');
const getDetailedAgenda = require('./app/getDetailedAgenda');

describe('02 - Indexed and not indexed', function() {
  let svc;
  this.timeout(30000);

  before(() => {
    svc = Service({
      elasticsearch: config.elasticsearch,
      alias: config.alias,
      listAgendas: listInterface('indexed', 100),
      getDetailedAgenda: getDetailedAgenda('indexed')
    });
  });

  before(() => svc.rebuild());

  it('only indexed agendas are returned by default', async () => {
    const {
      agendas
    } = await svc({}, {}, {
      includeFields: 'indexed',
      access: 'internal'
    });

    agendas.forEach(agenda => {
      assert.equal(agenda.indexed, true);
    });
  });

  it('if indexed option is null, both indexed and unindexed are returned', async () => {
    const {
      agendas
    } = await svc({}, {}, { includeFields: 'indexed', indexed: null, access: 'internal' });

    assert(agendas.filter(a => a.indexed).length > 0);
    assert(agendas.filter(a => !a.indexed).length > 0);
  });

});
