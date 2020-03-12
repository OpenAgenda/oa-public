'use strict';

const updateSource = require('../lib/updateSource');

const { Tracker, getJSON } = require('./utils');

describe('12 - updateSource', () => {
  const tracker = Tracker();

  const aggregatorAgenda = getJSON('fixtures/updateSource/aggregatorAgenda');
  const sourceAgenda = getJSON('fixtures/updateSource/sourceAgenda');

  beforeAll(async () => {
    await updateSource(
      {
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
      },
      aggregatorAgenda,
      1,
      [{ query: { categorie: 2 } }],
      { evaluate: true }
    );
  });

  test('loads source details first', () => {
    expect(tracker.calls[0].name).toBe('getSourceEntry');
  });

  test('if agenda is source, calls fn to update source, providing aggregator agenda and source entry', () => {
    expect(tracker.calls[1].name).toBe('updateSourceEntry');
    expect(tracker.calls[1].args[0]).toBe(aggregatorAgenda);
    expect(tracker.calls[1].args[1]).toEqual({
      id: 1,
      aggregatorId: 2,
      agenda: sourceAgenda
    });
  });

  test('calls enqueueing function last, providing uids of aggregator and source agendas', () => {
    expect(tracker.calls[3].name).toBe('enqueueLoadSourceEvaluates');
  });

  test('fix: enqueueLoadSourceEvaluates is given the aggregator and source rules', () => {
    expect(tracker.calls[3].args[0].sourceRules).toEqual([
      { query: { categorie: 2 } }
    ]);
    expect(tracker.calls[3].args[0].aggregatorRules).toEqual([
      { actions: [{ state: 1 }] }
    ]);
  });
});
