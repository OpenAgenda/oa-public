'use strict';

const evaluate = require('../lib/evaluateEvent');
const { getJSON } = require('./utils');

describe('04 - evaluate', () => {
  const data = getJSON('/fixtures/evaluate/data');

  describe('simple evaluate leading to new reference', () => {
    let args;
    let result;

    beforeAll(async () => {
      result = await evaluate(
        {
          getMergedSchema: async () => getJSON('fixtures/evaluate/getMergedSchema'),
          getEventReference: async () => getJSON('fixtures/evaluate/getEventReference'),
          referenceEvent: (a, e, d, o) => {
            args = [a, e, d, o];
            return { success: true };
          },
        },
        data
      );
    });

    test('result provides operation key set to `aggregation` when event was aggregated', () => {
      expect(result.operation).toBe('aggregation');
    });

    describe('referenceEvent call', () => {
      test('first argument is the uid of the aggregator on which the event is to be referenced', () => {
        expect(args[0]).toBe(data.aggregatorAgendaUid);
      });

      test('second is the uid of the event that is to be aggregated', () => {
        expect(args[1]).toBe(data.event.uid);
      });

      test('third is the additional values to be associated to event on aggregating agenda', () => {
        expect(args[2]).toEqual({
          entreelibre: [],
          'thematiques-metropolitaines': [8, 9],
          'types-devenements': [15, 23],
          public: [26],
          organisateur: [33],
          participation: null,
          'evenement-ponctuel': null,
        });
      });

      test('fourth contains the aggregation paths', () => {
        expect(args[3].paths).toEqual([
          [120, 19023, data.agenda.uid],
          [92893, 90193, data.agenda.uid],
        ]);
      });
    });
  });

  describe('evaluate leading to the paths of a reference being updated', () => {
    let args;

    beforeAll(async () => {
      await evaluate(
        {
          getMergedSchema: async () => getJSON('fixtures/evaluate/getMergedSchema'),
          getEventReference: async () => getJSON('fixtures/evaluate/getEventReference.2'),
          updateSourcePaths: (a, e, p) => {
            args = [a, e, p];
            return { success: true };
          },
        },
        data
      );
    });

    describe('updateSourcePaths call', () => {
      test('first arg is the uid of the aggregating agenda', () => {
        expect(args[0]).toBe(data.aggregatorAgendaUid);
      });

      test('second is the uid of the event that is to be aggregated', () => {
        expect(args[1]).toBe(data.event.uid);
      });

      test('third are the updated paths, amended with source paths', () => {
        expect(args[2]).toEqual([
          [1293, 7878697],
          [120, 19023, data.agenda.uid],
          [92893, 90193, data.agenda.uid],
        ]);
      });
    });
  });

  describe('evaluate with no call for change', () => {
    let called = false;

    beforeAll(async () => {
      await evaluate(
        {
          getMergedSchema: async () => getJSON('fixtures/evaluate/getMergedSchema'),
          getEventReference: async () => getJSON('fixtures/evaluate/getEventReference.3'),
          updateSourcePaths: () => {
            called = 'updateSourcePaths';
          },
          referenceEvent: () => {
            called = 'referenceEvent';
          },
        },
        data
      );
    });

    test('no state-changing function was called', () => {
      expect(called).toBe(false);
    });
  });

  describe('evaluate with call to remove source from paths', () => {
    let args;

    beforeAll(async () => {
      await evaluate(
        {
          getMergedSchema: async () => getJSON('fixtures/evaluate/getMergedSchema'),
          getEventReference: async () => getJSON('fixtures/evaluate/getEventReference.4'),
          updateSourcePaths: (a, e, p) => {
            args = [a, e, p];
            return { success: true };
          },
        },
        {
          ...data,
          sourceRules: getJSON('/fixtures/evaluate/sourceRules'), // rule for other town
        }
      );
    });

    test('updateSourcePaths provides paths without source', () => {
      expect(args[2]).toEqual([[1, 2, 3]]);
    });
  });

  describe('evaluate with call to remove reference altogether', () => {
    let args;

    beforeAll(async () => {
      await evaluate(
        {
          getMergedSchema: async () => getJSON('fixtures/evaluate/getMergedSchema'),
          getEventReference: async () => getJSON('fixtures/evaluate/getEventReference.3'),
          enqueueRemove(a) {
            args = a;
          },
        },
        {
          ...data,
          sourceRules: getJSON('/fixtures/evaluate/sourceRules'), // rule for other town
        }
      );
    });

    test('enqueueRemove is provided with payload required for removal', () => {
      expect(Object.keys(args)).toEqual([
        'sourceAgendaUid',
        'eventUid',
        'aggregatorAgendaUid',
        'reference',
        'batched',
      ]);
    });
  });

  it('evaluate is skiped if limit is set to null (default)', async () => {
    const result = await evaluate(
      {
        getAggregatedCount: () => 365,
        getMergedSchema: async () => getJSON('fixtures/evaluate/getMergedSchema'),
        getEventReference: async () => getJSON('fixtures/evaluate/getEventReference.2'),
        updateSourcePaths: () => ({ success: true }),
      },
      {
        ...data,
        sourceRules: getJSON('/fixtures/evaluate/sourceRules'), // rule for other town
      }
    );

    expect(result).toBeUndefined();
  });

  it('evaluate is skiped if limit is set to 1000', async () => {
    const result = await evaluate(
      {
        getAggregatedCount: () => 1000,
        getMergedSchema: async () => getJSON('fixtures/evaluate/getMergedSchema'),
        getEventReference: async () => getJSON('fixtures/evaluate/getEventReference.2'),
        updateSourcePaths: () => ({ success: true }),
      },
      {
        ...data,
        aggregatorLimit: 1000,
        sourceRules: getJSON('/fixtures/evaluate/sourceRules'), // rule for other town
      }
    );

    expect(result).toBeUndefined();
  });

  it('evaluate is not skiped if limit is set to -1', async () => {
    const result = await evaluate(
      {
        getAggregatedCount: () => 42000,
        getMergedSchema: async () => getJSON('fixtures/evaluate/getMergedSchema'),
        getEventReference: async () => getJSON('fixtures/evaluate/getEventReference.2'),
        updateSourcePaths: () => ({ success: true }),
      },
      {
        ...data,
        aggregatorLimit: -1,
        sourceRules: getJSON('/fixtures/evaluate/sourceRules'), // rule for other town
      }
    );

    expect(result).toEqual({
      success: true,
    });
  });
});
