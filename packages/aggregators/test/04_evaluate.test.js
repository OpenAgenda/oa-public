'use strict';

const {
  evaluateEvent: evaluate,
  processEvaluate,
} = require('../lib/evaluateEvent');
const { getJSON } = require('./utils');

describe('04 - evaluateBis', () => {
  const initalData = getJSON('/fixtures/evaluate/data');

  describe('simple evaluate leading to new reference', () => {
    const data = getJSON('/fixtures/evaluate/data');
    let referenceData;

    beforeAll(async () => {
      await evaluate(
        {
          getMergedSchema: async () =>
            getJSON('fixtures/evaluate/getMergedSchema'),
          getEventReference: async () =>
            getJSON('fixtures/evaluate/getEventReference'),
          referenceEvent: d => {
            referenceData = d;
            return { success: true };
          },
          enqueueEvaluate: q => q,
        },
        { ...data, batched: false },
      );
    });

    describe('referenceEvent call', () => {
      test('aggregatorAgendaUid is provided in the call', () => {
        expect(referenceData.aggregatorAgendaUid).toBe(
          initalData.aggregatorsBuffer[0].aggregatorAgendaUid,
        );
      });

      test('eventUid is provided in the call', () => {
        expect(referenceData.eventUid).toBe(data.event.uid);
      });

      test('payload contains the additional values to be associated to event on aggregating agenda', () => {
        expect(referenceData.payload).toEqual({
          entreelibre: [],
          'thematiques-metropolitaines': [8, 9],
          'types-devenements': [15, 23],
          public: [26],
          organisateur: [33],
          participation: null,
          'evenement-ponctuel': null,
        });
      });

      test('aggregated key is provided', () => {
        expect(referenceData.aggregated).toEqual(
          'fd030fdcfb94622b8e8358dcb1a11d94',
        );
      });

      test('aggregation paths are provided in paths key', () => {
        expect(referenceData.paths).toEqual([
          [120, 19023, data.agenda.uid],
          [92893, 90193, data.agenda.uid],
        ]);
      });

      test('batched boolean is passed to referenceEvent call', () => {
        expect(referenceData.batched).toBe(false);
      });

      test('sourceAgenda is passed to referenceEvent call', () => {
        expect(referenceData.sourceAgenda.uid).toBe(50781256);
      });
    });
  });

  describe('evaluate leading to the paths of a reference being updated', () => {
    const data = getJSON('/fixtures/evaluate/data');
    let updatePathsData;

    beforeAll(async () => {
      await evaluate(
        {
          getMergedSchema: async () =>
            getJSON('fixtures/evaluate/getMergedSchema'),
          getEventReference: async () =>
            getJSON('fixtures/evaluate/getEventReference.2'),
          updateSourcePaths: d => {
            updatePathsData = d;
            return { success: true };
          },
          enqueueEvaluate: q => q,
        },
        data,
      );
    });

    describe('updateSourcePaths call', () => {
      test('uid of the aggregating agenda is provided', () => {
        expect(updatePathsData.aggregatorAgendaUid).toBe(
          initalData.aggregatorsBuffer[0].aggregatorAgendaUid,
        );
      });

      test('uid of the event that is to be aggregated is provided', () => {
        expect(updatePathsData.eventUid).toBe(data.event.uid);
      });

      test('updated paths amended with source paths are provided', () => {
        expect(updatePathsData.paths).toEqual([
          [1293, 7878697],
          [120, 19023, data.agenda.uid],
          [92893, 90193, data.agenda.uid],
        ]);
      });
    });
  });

  describe('evaluate leading to a reference being updated', () => {
    let updateEventData;
    beforeAll(async () => {
      await evaluate(
        {
          getMergedSchema: async () =>
            getJSON('fixtures/evaluate/getMergedSchema'),
          getEventReference: async () =>
            getJSON('fixtures/evaluate/getEventReference.5'),
          updateEventReference: d => {
            updateEventData = d;
          },
          enqueueEvaluate: q => q,
        },
        {
          aggregatorsBuffer: [
            {
              aggregatorAgendaUid: 50522407,
              sourceRules: getJSON(
                '/fixtures/evaluate/rulesActingOnAnAdditionalChoiceField',
              ),
              aggregatorLimit: null,
            },
          ],
          agenda: getJSON('/fixtures/evaluate/sourceAgenda'),
          formSchema: getJSON('/fixtures/evaluate/sourceFormSchema'),
          event: getJSON('/fixtures/evaluate/eventBeforeAndAfter').after,
          before: getJSON('/fixtures/evaluate/eventBeforeAndAfter').before,
        },
      );
    });

    test('updateEventReference is provided with aggregator uid', () => {
      expect(updateEventData.aggregatorAgendaUid).toBe(50522407);
    });

    test('updateEventReference is provided with event uid', () => {
      expect(updateEventData.eventUid).toBe(28304431);
    });

    test('updateEventReference is provided with patched values as third argument', () => {
      expect(updateEventData.payload).toEqual({ 'types-devenements': 19 });
    });

    test('updateEventReference is provided with new aggregate key', () => {
      expect(updateEventData.aggregated).toBe(
        'fc4d4eb0abc54822d23f717dd6e05081',
      );
    });
  });

  describe('evaluate with no call for change', () => {
    const data = getJSON('/fixtures/evaluate/data');
    let called = false;

    beforeAll(async () => {
      await evaluate(
        {
          getMergedSchema: async () =>
            getJSON('fixtures/evaluate/getMergedSchema'),
          getEventReference: async () =>
            getJSON('fixtures/evaluate/getEventReference.3'),
          updateSourcePaths: () => {
            called = 'updateSourcePaths';
          },
          referenceEvent: () => {
            called = 'referenceEvent';
          },
          enqueueEvaluate: q => q,
        },
        data,
      );
    });

    test('no state-changing function was called', () => {
      expect(called).toBe(false);
    });
  });

  describe('evaluate with call to remove source from paths', () => {
    const data = getJSON('/fixtures/evaluate/data');
    let args;

    beforeAll(async () => {
      await evaluate(
        {
          getMergedSchema: async () =>
            getJSON('fixtures/evaluate/getMergedSchema'),
          getEventReference: async () =>
            getJSON('fixtures/evaluate/getEventReference.4'),
          updateSourcePaths: a => {
            args = a;
            return { success: true };
          },
          enqueueEvaluate: q => q,
        },
        {
          ...data,
          aggregatorsBuffer: [
            {
              aggregatorAgendaUid:
                data.aggregatorsBuffer[0].aggregatorAgendaUid,
              aggregatorLimit: data.aggregatorsBuffer[0].aggregatorLimit,
              aggregatorRules: data.aggregatorsBuffer[0].aggregatorRules,
              sourceRules: getJSON('/fixtures/evaluate/sourceRules'), // rule for other town
            },
          ],
        },
      );
    });

    test('updateSourcePaths provides paths without source', () => {
      expect(args.paths).toEqual([[1, 2, 3]]);
    });
  });

  describe('evaluate with call to remove reference altogether', () => {
    const data = getJSON('/fixtures/evaluate/data');
    let args;

    beforeAll(async () => {
      await evaluate(
        {
          getMergedSchema: async () =>
            getJSON('fixtures/evaluate/getMergedSchema'),
          getEventReference: async () =>
            getJSON('fixtures/evaluate/getEventReference.3'),
          enqueueRemove(a) {
            args = a;
          },
          enqueueEvaluate: q => q,
        },
        {
          ...data,
          aggregatorsBuffer: [
            {
              aggregatorAgendaUid:
                data.aggregatorsBuffer[0].aggregatorAgendaUid,
              aggregatorLimit: data.aggregatorsBuffer[0].aggregatorLimit,
              aggregatorRules: data.aggregatorsBuffer[0].aggregatorRules,
              sourceRules: getJSON('/fixtures/evaluate/sourceRules'), // rule for other town
            },
          ],
        },
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

  it('evaluate is skipped if limit is set to null (default)', async () => {
    const data = getJSON('/fixtures/evaluate/data');
    const result = await evaluate(
      {
        getAggregatedCount: () => 365,
        getMergedSchema: async () =>
          getJSON('fixtures/evaluate/getMergedSchema'),
        getEventReference: async () =>
          getJSON('fixtures/evaluate/getEventReference.2'),
        updateSourcePaths: () => ({ success: true }),
        enqueueEvaluate: q => q,
      },
      {
        ...data,
        aggregatorsBuffer: [
          {
            aggregatorAgendaUid: data.aggregatorsBuffer[0].aggregatorAgendaUid,
            aggregatorLimit: data.aggregatorsBuffer[0].aggregatorLimit,
            aggregatorRules: data.aggregatorsBuffer[0].aggregatorRules,
            sourceRules: getJSON('/fixtures/evaluate/sourceRules'), // rule for other town
          },
        ],
      },
    );

    expect(result).toBeUndefined();
  });

  it('evaluate is skipped if limit is set to 1000', async () => {
    const data = getJSON('/fixtures/evaluate/data');
    const result = await evaluate(
      {
        getAggregatedCount: () => 1000,
        getMergedSchema: async () =>
          getJSON('fixtures/evaluate/getMergedSchema'),
        getEventReference: async () =>
          getJSON('fixtures/evaluate/getEventReference.2'),
        updateSourcePaths: () => ({ success: true }),
        enqueueEvaluate: q => q,
      },
      {
        ...data,
        aggregatorsBuffer: [
          {
            aggregatorAgendaUid: data.aggregatorsBuffer[0].aggregatorAgendaUid,
            aggregatorLimit: 1000,
            aggregatorRules: data.aggregatorsBuffer[0].aggregatorRules,
            sourceRules: getJSON('/fixtures/evaluate/sourceRules'), // rule for other town
          },
        ],
      },
    );

    expect(result).toBeUndefined();
  });

  it('evaluate is not skipped if limit is set to -1', async () => {
    const data = getJSON('/fixtures/evaluate/data');
    const result = await processEvaluate(
      {
        getAggregatedCount: () => 42000,
        getMergedSchema: async () =>
          getJSON('fixtures/evaluate/getMergedSchema'),
        getEventReference: async () =>
          getJSON('fixtures/evaluate/getEventReference.2'),
        updateSourcePaths: () => ({ success: true }),
        enqueueEvaluate: q => q,
      },
      {
        ...data,
        sourceAgenda: data.agenda,
        aggregator: {
          aggregatorAgendaUid: data.aggregatorsBuffer[0].aggregatorAgendaUid,
          aggregatorLimit: -1,
          aggregatorRules: data.aggregatorsBuffer[0].aggregatorRules,
          sourceRules: getJSON('/fixtures/evaluate/sourceRules'), // rule for other town
        },
        log: e => e,
      },
    );

    expect(result).toEqual('updateSourcePaths');
  });
});
