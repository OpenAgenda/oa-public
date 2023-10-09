'use strict';

const fs = require('node:fs');

const addSource = require('../lib/addSource');
const loadSourceEvaluates = require('../lib/loadSourceEvaluates');

function _getJSON(relativePath) {
  return JSON.parse(
    fs.readFileSync(`${__dirname}/${relativePath}.json`, 'utf-8'),
  );
}

function _async(relativePath) {
  return async () => _getJSON(relativePath);
}

describe('06 - addSource', () => {
  describe('addSource', () => {
    let enqueuedData = null;
    let addSourceEntryWasCalled = false;

    beforeAll(async () => {
      await addSource(
        {
          getAgendaSourceId: () => false,
          addSourceEntry: () => {
            addSourceEntryWasCalled = true;
            return _async('fixtures/addSource/addSourceEntry')();
          },
          getMergedSchema: _async('fixtures/addSource/formSchema'),
          enqueueLoadSourceEvaluates: async data => {
            enqueuedData = data;
          },
        },
        { uid: 123, slug: 'ndm2020' },
        { uid: 456, slug: 'ndm2020-idf' },
        [],
        { query: { relative: 'current' } },
      );
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
    const enqueuedListEventReferencesQuery = [];

    beforeAll(async () => {
      let looped = false;

      await loadSourceEvaluates(
        {
          loadEvent: _async('fixtures/addSource/loadForEvaluate.event'),
          listEventReferences: async (data, after, query) => {
            enqueuedListEventReferencesQuery.push(query);
            if (looped) {
              return _async(
                'fixtures/addSource/listEventReferencesAfterNull',
              )();
            }
            looped = true;
            return _async('fixtures/addSource/listEventReferences')();
          },
          enqueueEvaluate: data => {
            enqueuedForEvaluate.push(data);
          },
        },
        _getJSON('fixtures/addSource/loadSourceEvaluates'),
      );
    });

    test('data required for evaluate is enqueued', () => {
      expect(Object.keys(enqueuedForEvaluate[0])).toEqual([
        'agenda',
        'event',
        'batched',
        'formSchema',
        'aggregatorsBuffer',
      ]);
    });

    test('enqueueLoadForEvaluate is called as many times as list interface provided references', () => {
      expect(enqueuedForEvaluate.length).toBe(14);
    });
    test('event is given to evaluate', () => {
      expect(enqueuedForEvaluate[0].event.uid).toEqual(85780923);
    });
    test('query is given to interface', () => {
      expect(enqueuedListEventReferencesQuery[0]).toStrictEqual({
        relative: 'current',
      });
    });
  });
});
