'use strict';

const removeSource = require('../lib/removeSource');
const loadSourceRemoves = require('../lib/loadSourceRemoves');

const { Tracker, getJSON } = require('./utils');

describe('07 - removeSource', () => {
  describe('removeSource', () => {
    const tracker = Tracker();

    const aggregatorAgenda = getJSON('fixtures/removeSource/aggregatorAgenda');
    const sourceAgenda = getJSON('fixtures/removeSource/sourceAgenda');

    beforeAll(async () => {
      await removeSource(
        {
          removeSourceEntry: tracker('removeSourceEntry'),
          getSourceEntry: tracker('getSourceEntry', {
            id: 1,
            aggregatorId: 2,
            agenda: sourceAgenda,
          }),
          enqueueLoadSourceRemoves: tracker('enqueueLoadSourceRemoves'),
        },
        aggregatorAgenda,
        1,
        { evaluate: true }
      );
    });

    test('loads source details first', () => {
      expect(tracker.calls[0].name).toBe('getSourceEntry');
    });

    test('if agenda is source, calls fn to remove source, providing aggregator and source agendas', () => {
      expect(tracker.calls[1].name).toBe('removeSourceEntry');
      expect(tracker.calls[1].args[0]).toBe(aggregatorAgenda);
      expect(tracker.calls[1].args[1]).toBe(sourceAgenda);
    });

    test('calls enqueueing function last, providing uids of aggregator and source agendas', () => {
      expect(tracker.calls[2].name).toBe('enqueueLoadSourceRemoves');
      expect(tracker.calls[2].args[0]).toEqual({
        aggregatorAgendaUid: aggregatorAgenda.uid,
        sourceAgendaUid: sourceAgenda.uid,
      });
    });
  });

  describe('loadSourceRemoves', () => {
    const tracker = Tracker();
    let loops = 0;

    beforeAll(async () => {
      await loadSourceRemoves(
        {
          listEventReferences: tracker('listEventReferences', () => {
            const json = getJSON(
              `fixtures/removeSource/listEventReferences${
                loops > 0 ? 'Empty' : ''
              }`
            );

            loops += 1;

            return json;
          }),
          enqueueRemove: tracker('enqueueRemove'),
        },
        123,
        456
      );
    });

    test('calls listEventReferences first to list events of source to evaluate on aggregator', () => {
      expect(tracker.calls[0].name).toBe('listEventReferences');
    });

    test('enqueueRemove is called for each event', () => {
      expect(
        tracker.calls.slice(1, 21).filter(c => c.name === 'enqueueRemove')
          .length
      ).toBe(20);
    });
  });
});
