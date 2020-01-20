'use strict';

const should = require('should');
const config = require('../testconfig');
const Service = require('../');
const Cluster = require('../service/cluster');

describe('20 - event-search - util: cluster', function() {
  let service, deletedIndices, stats;

  before(() => {
    service = Service(config);
  });

  describe('general cluster information', () => {

    before(async () => {
      stats = await service.cluster.stats();
    });

    it('cluster general information is provided', () => {
      Object.keys(stats).should.eql([
        'status',
        'indexCount',
        'documentCount',
        'usedCPUPercent',
        'usedMemoryPercent'
      ]);
    });

  });

  describe('configure cluster', () => {
    let response;
    const maxShardsPerNode = '' + ((new Date).getTime() % 100000 + 1000);

    before(async () => {

      await service.cluster.configure();

      response = await service.cluster.configure({
        'cluster.max_shards_per_node': maxShardsPerNode
      });
    });

    it('if cluster setting is different, an update is put', () => {
      response.updated.should.equal(true);
    });

    it('if cluster setting is same, no update is put', async () => {
      response = await service.cluster.configure({
        'cluster.max_shards_per_node': maxShardsPerNode
      });

      response.updated.should.equal(false);
    });

  });
});
