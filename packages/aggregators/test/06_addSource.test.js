'use strict';

const fs = require('fs');

const addSource = require('../lib/addSource');
const loadSourceEvaluates = require('../lib/loadSourceEvaluates');

describe('06 - addSource', () => {

  describe('addSource', () => {

    let enqueuedData = null;
    let addSourceEntryWasCalled = false;

    beforeAll(async () => {
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

    test('calls for a source entry creation', () => {
      expect(addSourceEntryWasCalled).toBe(true);
    });

    test('data passed to queue contains uid of aggregator agenda', () => {
      expect(enqueuedData.aggregatorAgendaUid).toBe(123);
    });

    test('data passed to queue contains source formSchema', () => {
      expect(enqueuedData.formSchema).toBeTruthy();
    });

  });

  describe('loadSourceEvaluates', () => {

    const enqueuedForEvaluate = [];

    beforeAll(async () => {
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

    test('data required for evaluate is enqueued', () => {
      expect(Object.keys(enqueuedForEvaluate[0])).toEqual([
        'agenda',
        'event',
        'aggregatorAgendaUid',
        'aggregatorRules',
        'batched',
        'formSchema',
        'sourceRules'
      ]);
    });

    test(
      'enqueueLoadForEvaluate is called as many times as list interface provided references',
      () => {
        expect(enqueuedForEvaluate.length).toBe(20);
      }
    );
  });

});

function _async(relativePath) {
  return async () => _getJSON(relativePath);
}

function _getJSON(relativePath) {
  return JSON.parse(fs.readFileSync(__dirname + '/' + relativePath +'.json', 'utf-8'));
}
