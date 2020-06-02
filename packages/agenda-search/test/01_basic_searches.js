'use strict';

const _ = require('lodash');
const should = require('should');
const config = require('../testconfig');
const Service = require('../service');
const listInterface = require('./app/listInterface');

describe('search', function() {
  let svc;
  this.timeout(30000);

  before(() => {
    svc = Service({
      elasticsearch: config.elasticsearch,
      alias: config.alias,
      listAgendas: listInterface.bind(null, 100),
      imagePath: config.imagePath,
      defaultImage: config.defaultImage
    });
  });

  before(() => svc.rebuild());

  it('list', async () => {
    const {
      items: agendas,
      total
    } = await svc.list({}, 0, 10);

    total.should.equal(101);
  });

  it('updates agenda items after given updatedAt', async () => {
    const before = new Date();
    before.setHours(before.getHours() - 1);

    const result = await svc.resyncUpdated(before);

    // capped at 20
    result.should.eql({ indexed: 20, updated: 0 });
  });

  it('keyword search', async () => {
    const {
      total
    } = await svc.list({ search: 'jardin' }, 0, 10);

    total.should.equal(2);
  });


  it('official filter: all retrieved agendas are official', async () => {
    const {
      items: agendas
    } = await svc.list({ search: 'title', official: true });

    agendas.filter(a => !a.official).length.should.equal(0);
  });

});
