'use strict';

const fs = require('fs');
const should = require('should');

const evaluate = require('../Aggregators/lib/evaluateEvent');

describe('Aggregators evaluate', () => {

  describe('Successful aggregation', () => {

    describe( 'simple evaluate', () => {
      const data = JSON.parse(
        fs.readFileSync(__dirname + '/fixtures/evaluate/data.json', 'utf-8')
      );

      let referenceEventArguments;
      let result;

      before( async () => {
        result = await evaluate({
          getMergedSchema: _async('fixtures/evaluate/getMergedSchema'),
          getEventReference: _async('fixtures/evaluate/getEventReference'),
          referenceEvent: (...args) => {
            referenceEventArguments = args;
          }
        }, data);
      });

      it('result provides operation key set to `aggregation` when event was aggregated', () => {
        result.operation.should.equal('aggregation');
      });

      it('first argument provided to referenceEvent interface is the source agenda uid', () => {
        referenceEventArguments[0].uid.should.equal(data.agenda.uid);
      });

      it('second argument provided to referenceEvent interface is the uid of the aggregating agenda', () => {
        referenceEventArguments[1].should.equal(data.aggregatorAgendaUid);
      });

      it('third argument provided to referenceEvent interface is the uid of the aggregated event', () => {
        referenceEventArguments[2].should.equal(data.event.uid);
      });

      it('fourth argument contains extended values to be applied on add of event', () => {
        referenceEventArguments[3].should.eql({
          entreelibre: [],
          'thematiques-metropolitaines': [ 8, 9 ],
          'types-devenements': [ 15, 23 ],
          public: [ 26 ],
          organisateur: [ 33 ],
          participation: null,
          'evenement-ponctuel': null,
          state: 2
        });
      });

    });

  });

});

function _async(relativePath) {
  const data = JSON.parse(fs.readFileSync(__dirname + '/' + relativePath +'.json', 'utf-8'));

  return async () => data;
}
