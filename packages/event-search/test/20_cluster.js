'use strict';

const assert = require('assert');
const config = require('../testconfig');
const Service = require('../');
const Cluster = require('../cluster');

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
      assert.deepEqual(Object.keys(stats), [
        'status',
        'indexCount',
        'documentCount',
        'usedCPUPercent',
        'usedMemoryPercent'
      ]);
    });

  });

  describe('index replicas', () => {

    it('update index replica number', async () => {
      const indexReplicaCount = await service.cluster.indices().replicas.get();

      await service.cluster.indices().replicas.set(indexReplicaCount + 1);

      assert.equal(await service.cluster.indices().replicas.get(), indexReplicaCount + 1);
    });

  });

});
