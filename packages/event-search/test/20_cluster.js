'use strict';

const should = require('should');
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
      Object.keys(stats).should.eql([
        'status',
        'indexCount',
        'documentCount',
        'usedCPUPercent',
        'usedMemoryPercent'
      ]);
    });

  });

});
