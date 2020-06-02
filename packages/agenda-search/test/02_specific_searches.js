"use strict";

process.env.NODE_ENV = 'test';

const ih = require('immutability-helper');
const should = require('should');

const config = require('../testconfig');

const Service = require('../service');

const agendas = JSON.parse(require('fs').readFileSync(__dirname + '/fixtures/agendas.json', 'utf-8'));


describe('specific searches', function() {
  let svc;

  this.timeout(10000);

  before(() => {
    svc = Service({
      elasticsearch: config.elasticsearch,
      alias: config.alias,
      listAgendas: async (query, offset, limit, { detailed }) => {
        return agendas.slice(offset, offset + limit);
      },
      imagePath: config.imagePath,
      defaultImage: config.defaultImage
    });
  });

  before(() => svc.rebuild());

  it('fetch all', async () => {
    const { total, items } = await svc.list({}, 0, 10);

    total.should.equal(4);
  });


  it('fetch by search on title', async () => {
    const { total, items } = await svc.list({
      search: 'Ville'
    }, 0, 10);
  });

  it('fetch official only', async () => {
    const { total, items } = await svc.list({
      official: true
    }, 0, 10);

    total.should.equal(3);
  });

  it('match search on keyword', async () => {
    const { total, items: agendas } = await svc.list({
      search: 'France'
    }, 0, 10);

    total.should.equal(1);

    agendas[0].title.should.equal('Au Théâtre ce soir');
  });

  it('official search sorts by officialized timestamp', async () => {
    const { total, items: agendas } = await svc.list({
      official: true
    }, 0, 10);

    const agendasUids = agendas.map(a => a.uid).join('-');

    agendasUids.should.equal('2-4-1');

  });

});
