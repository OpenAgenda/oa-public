'use strict';

const ih = require('immutability-helper');
const should = require('should');

const {
  getJSON
} = require('./utils');

const evaluate = require('../lib/evaluateEvent');

describe('04 - evaluate', () => {

  const data = getJSON('/fixtures/evaluate/data');

  describe('simple evaluate leading to new reference', () => {
    let args, result;

    before(async () => {
      result = await evaluate({
        getMergedSchema: async () => getJSON('fixtures/evaluate/getMergedSchema'),
        getEventReference: async () => getJSON('fixtures/evaluate/getEventReference'),
        referenceEvent: (a, e, d, o) => {
          args = [a, e, d, o];
          return { success: true };
        }
      }, data);
    });

    it('result provides operation key set to `aggregation` when event was aggregated', () => {
      result.operation.should.equal('aggregation');
    });

    describe('referenceEvent call', () => {

      it('first argument is the uid of the aggregator on which the event is to be referenced', () => {
        args[0].should.equal(data.aggregatorAgendaUid);
      });

      it('second is the uid of the event that is to be aggregated', () => {
        args[1].should.equal(data.event.uid);
      });

      it('third is the additional values to be associated to event on aggregating agenda', () => {
        args[2].should.eql({
          entreelibre: [],
          'thematiques-metropolitaines': [ 8, 9 ],
          'types-devenements': [ 15, 23 ],
          public: [ 26 ],
          organisateur: [ 33 ],
          participation: null,
          'evenement-ponctuel': null
        });
      });

      it('fourth contains the aggregation paths', () => {

        args[3].paths.should.eql([
          [120, 19023, data.agenda.uid],
          [92893, 90193, data.agenda.uid]
        ]);

      });
    });

  });

  describe('evaluate leading to the paths of a reference being updated', () => {
    let args, result;

    before(async () => {
      await evaluate({
        getMergedSchema: async () => getJSON('fixtures/evaluate/getMergedSchema'),
        getEventReference: async () => getJSON('fixtures/evaluate/getEventReference.2'),
        updateSourcePaths: (a, e, p) => {
          args = [a, e, p];
          return { success: true };
        }
      }, data);
    });

    describe('updateSourcePaths call', () => {

      it('first arg is the uid of the aggregating agenda', () => {
        args[0].should.equal(data.aggregatorAgendaUid);
      });

      it('second is the uid of the event that is to be aggregated', () => {
        args[1].should.equal(data.event.uid);
      });

      it('third are the updated paths, amended with source paths', () => {
        args[2].should.eql([
          [1293, 7878697],
          [120, 19023, data.agenda.uid],
          [92893, 90193, data.agenda.uid]
        ])
      });
    });

  });

  describe('evaluate with no call for change', () => {

    let called = false;

    before(async () => {
      await evaluate({
        getMergedSchema: async () => getJSON('fixtures/evaluate/getMergedSchema'),
        getEventReference: async () => getJSON('fixtures/evaluate/getEventReference.3'),
        updateSourcePaths: () => {
          called = 'updateSourcePaths';
        },
        referenceEvent: () => {
          called = 'referenceEvent';
        },
      }, data);
    });

    it('no state-changing function was called', () => {
      called.should.equal(false);
    });

  });

  describe('evaluate with call to remove source from paths', () => {
    let args;

    before(async () => {
      await evaluate({
        getMergedSchema: async () => getJSON('fixtures/evaluate/getMergedSchema'),
        getEventReference: async () => getJSON('fixtures/evaluate/getEventReference.4'),
        updateSourcePaths: (a, e, p) => {
          args = [a, e, p];
          return { success: true };
        }
      }, { ...data,
        sourceRules: getJSON('/fixtures/evaluate/sourceRules') // rule for other town
      });
    });

    it('updateSourcePaths provides paths without source', () => {
      args[2].should.eql([ [ 1, 2, 3 ]]);
    });

  });

  describe('evaluate with call to remove reference altogether', () => {
    let args;

    before(async () => {
      await evaluate({
        getMergedSchema: async () => getJSON('fixtures/evaluate/getMergedSchema'),
        getEventReference: async () => getJSON('fixtures/evaluate/getEventReference.3'),
        enqueueRemove: function(a) {
          args = a;
        }
      }, { ...data,
        sourceRules: getJSON('/fixtures/evaluate/sourceRules') // rule for other town
      });
    });

    it('enqueueRemove is provided with payload required for removal', () => {
      Object.keys(args).should.eql([
        'sourceAgendaUid',
        'eventUid',
        'aggregatorAgendaUid',
        'reference',
        'batched'
      ]);
    });

  });

});
