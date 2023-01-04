'use strict';

const config = require('../testconfig');
const Service = require('..');

describe('20 - event-search - util: cluster', () => {
  let service;
  let stats;

  beforeAll(() => {
    service = Service(config);
  });

  describe('general cluster information', () => {
    beforeAll(async () => {
      stats = await service.cluster.stats();
    });

    it('cluster general information is provided', () => {
      expect(Object.keys(stats)).toEqual([
        'status',
        'indexCount',
        'documentCount',
        'usedCPUPercent',
        'usedMemoryPercent',
      ]);
    });
  });

  describe('nodes', () => {
    it('get info', async () => {
      const nodes = await service.cluster.nodes();
      expect(nodes instanceof Array).toBe(true);
    });
  });

  describe('index replicas', () => {
    it('update index replica number', async () => {
      const indexReplicaCount = await service.cluster.indices().replicas.get();

      await service.cluster.indices().replicas.set(indexReplicaCount + 1);

      expect(await service.cluster.indices().replicas.get()).toBe(indexReplicaCount + 1);
    });
  });
});
