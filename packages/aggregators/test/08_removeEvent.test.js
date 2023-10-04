'use strict';

const { removeEvent, processRemove } = require('../lib/removeEvent');

const { Tracker } = require('./utils');

describe('08 - removeEvent', () => {
  test('if reference shows add by aggregation and source is last source refered, unreferenceEvent is called', async () => {
    const tracker = Tracker();
    const aggregatorAgendaUid = 123;
    const sourceAgendaUid = 71413881;
    const eventUid = 1;

    await processRemove(
      {
        getEventReference: tracker('getEventReference', {
          sourceAgendaUid: [sourceAgendaUid],
          aggregated: true,
        }),
        updateSourcePaths: tracker('updateSourcePaths'),
        unreferenceEvent: tracker('unreferenceEvent', { success: true }),
        enqueueRemove: q => q,
      },
      {
        aggregatorAgendaUid,
        event: { uid: eventUid },
        sourceAgendaUid,
        log: r => r,
      },
    );

    const unreferenceCall = tracker.calls.pop();

    expect(unreferenceCall.name).toBe('unreferenceEvent');
    expect(unreferenceCall.args).toEqual([
      aggregatorAgendaUid,
      eventUid,
      { batched: undefined },
    ]);
  });

  test('if reference shows that other sources reference event, then updateSourcePaths is called', async () => {
    const tracker = Tracker();
    await removeEvent(
      {
        getEventReference: tracker('getEventReference', {
          sourcePaths: [[71413881], [54674789]],
          aggregated: true,
        }),
        updateSourcePaths: tracker('updateSourcePaths'),
        unreferenceEvent: tracker('unreferenceEvent', { success: true }),
        enqueueRemove: q => q,
      },
      {
        sourceAgendaUid: 71413881,
        event: { uid: 1 },
        aggregatorsBuffer: [
          {
            aggregatorAgendaUid: 123,
          },
        ],
      },
    );

    expect(tracker.calls.pop().name).toBe('updateSourcePaths');
  });

  test('if reference shows that event was not added to aggregator agenda through aggregation, then updateSourcePaths event if source is last', async () => {
    const tracker = Tracker();
    await removeEvent(
      {
        getEventReference: tracker('getEventReference', {
          sourcePaths: [71413881],
          aggregated: false,
        }),
        updateSourcePaths: tracker('updateSourcePaths'),
        unreferenceEvent: tracker('unreferenceEvent', { success: true }),
        enqueueRemove: q => q,
      },
      {
        sourceAgendaUid: 71413881,
        event: { uid: 1 },
        aggregatorsBuffer: [
          {
            aggregatorAgendaUid: 123,
          },
        ],
      },
    );

    expect(tracker.calls.pop().name).toBe('updateSourcePaths');
  });

  test('if unreference fails, result provides success bool at false and errors', async () => {
    const tracker = Tracker();
    const result = await processRemove(
      {
        getEventReference: tracker('getEventReference', {
          sourceAgendaUid: [71413881],
          aggregated: true,
        }),
        unsetSourceUidOnExistingReference: tracker(
          'unsetSourceUidOnExistingReference',
        ),
        unreferenceEvent: tracker('unreferenceEvent', {
          success: false,
          errors: ['error1'],
        }),
        enqueueRemove: q => q,
      },
      {
        sourceAgendaUid: 71413881,
        event: { uid: 1 },
        aggregatorAgendaUid: 123,
        log: r => r,
      },
    );

    expect(result).toEqual({
      action: 'failed to remove reference',
      errors: ['error1'],
    });
  });
});
