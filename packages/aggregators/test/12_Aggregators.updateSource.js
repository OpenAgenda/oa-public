'use strict';

const should = require('should');

const updateSource = require('../Aggregators/lib/updateSource');

const {
  asAsync,
  Tracker,
  getJSON
} = require('./utils');

describe('Aggregators updateSource', () => {

  describe('updateSource', () => {
    const tracker = Tracker();

    const aggregatorAgenda = getJSON('fixtures/updateSource/aggregatorAgenda');
    const sourceAgenda = getJSON('fixtures/updateSource/sourceAgenda');

    let updateSourceWasCalled = false;

    before(async () => {
      await updateSource({
        updateSourceEntry: tracker('updateSourceEntry', {
          aggregator: aggregatorAgenda,
          source: sourceAgenda
        }),
        getSourceEntry: tracker('getSourceEntry', {
          id: 1,
          aggregatorId: 2,
          agenda: sourceAgenda
        }),
        enqueueLoadSourceEvaluates: tracker('enqueueLoadSourceEvaluates'),
        getMergedSchema: tracker('getMergedSchema')
      }, aggregatorAgenda, 1, [{ query: { categorie: 2 } }], { evaluate: true });
    });

    it('loads source details first', () => {
      tracker.calls[0].name.should.equal('getSourceEntry');
    });

    it('if agenda is source, calls fn to update source, providing aggregator agenda and source entry', () => {
      tracker.calls[1].name.should.equal('updateSourceEntry');
      tracker.calls[1].args[0].should.equal(aggregatorAgenda);
      tracker.calls[1].args[1].should.eql({
        id: 1,
        aggregatorId: 2,
        agenda: sourceAgenda
      });
    });

    it('calls enqueueing function last, providing uids of aggregator and source agendas', () => {
      tracker.calls[3].name.should.equal('enqueueLoadSourceEvaluates');
    });

    it('fix: enqueueLoadSourceEvaluates is given the aggregator and source rules', () => {
      tracker.calls[3].args[0].sourceRules.should.eql([{ query: { categorie: 2 } }]);
      tracker.calls[3].args[0].aggregatorRules.should.eql([{ actions: [{ state: 1 }] }]);
    });

  });

});
