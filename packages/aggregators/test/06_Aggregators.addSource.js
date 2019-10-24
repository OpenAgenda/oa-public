'use strict';

const fs = require('fs');
const should = require('should');

const addSource = require('../Aggregators/lib/addSource');
const loadSourceEvaluates = require('../Aggregators/lib/loadSourceEvaluates');

describe('Aggregators addSource', () => {

  describe('addSource', () => {

    let enqueuedData = null;
    let addSourceEntryWasCalled = false;

    before(async () => {
      await addSource({
        getAgendaSourceId: async (sourceAgenda, aggregatorAgenda) => false,
        addSourceEntry: (aggregatorAgenda, sourceAgenda) => {
          addSourceEntryWasCalled = true;
          return _async('fixtures/addSource/addSourceEntry')();
        },
        getMergedSchema: _async('fixtures/addSource/formSchema'),
        enqueueLoadSourceEvaluates: async data => { enqueuedData = data; }
      }, { uid: 123, slug: 'ndm2020' }, { uid: 456, slug: 'ndm2020-idf' }, [], { evaluate: true });
    });

    it('calls for a source entry creation', () => {
      addSourceEntryWasCalled.should.equal(true);
    });

    it('data passed to queue contains uid of aggregator agenda', () => {
      enqueuedData.aggregatorAgendaUid.should.equal(123);
    });

    it('data passed to queue contains source formSchema', () => {
      enqueuedData.formSchema.should.be.ok();
    });

  });

  describe('loadSourceEvaluates', () => {

    const enqueuedForEvaluate = [];

    before(async () => {
      let looped = false;

      await loadSourceEvaluates({
        loadEvent: _async('fixtures/addSource/loadForEvaluate.event'),
        listEventReferences: async (agendaUid, lastId) => {
          if (looped) return { events: [] };
          looped = true;
          return _async('fixtures/addSource/listEventReferences')();
        },
        enqueueEvaluate: data => {
          enqueuedForEvaluate.push(data);
        }
      }, _getJSON('fixtures/addSource/loadSourceEvaluates'))
    });

    it('data required for evaluate is enqueued', () => {
      Object.keys(enqueuedForEvaluate[0]).should.eql([
        'agenda',
        'event',
        'aggregatorAgendaUid',
        'batched',
        'formSchema',
        'sourceRules',
        'aggregatorRules'
      ]);
    });

    it('enqueueLoadForEvaluate is called as many times as list interface provided references', () => {
      enqueuedForEvaluate.length.should.equal(20);
    });
  });

});

function _async(relativePath) {
  return async () => _getJSON(relativePath);
}

function _getJSON(relativePath) {
  return JSON.parse(fs.readFileSync(__dirname + '/' + relativePath +'.json', 'utf-8'));
}
