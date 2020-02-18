'use strict';

const removeEvent = require('../lib/removeEvent');
const should = require('should');

const {
  asAsync,
  Tracker,
  getJSON
} = require('./utils');

describe('08 - removeEvent', () => {

  it('if reference shows add by aggregation and source is last source refered, unreferenceEvent is called', async () => {
    const tracker = Tracker();
    const aggregatorAgendaUid = 123;
    const sourceAgendaUid = 71413881;
    const eventUid = 1;

    await removeEvent({
      getEventReference: tracker('getEventReference', {
        sourceAgendaUid: [ sourceAgendaUid ],
        aggregated: true
      }),
      updateSourcePaths: tracker('updateSourcePaths'),
      unreferenceEvent: tracker('unreferenceEvent', { success: true })
    }, {
      aggregatorAgendaUid,
      sourceAgendaUid,
      eventUid
    });

    const unreferenceCall = tracker.calls.pop();

    unreferenceCall.name.should.equal('unreferenceEvent');
    unreferenceCall.args.should.eql([
      aggregatorAgendaUid,
      eventUid,
      { batched: undefined }
    ]);
  });

  it('if reference shows that other sources reference event, then updateSourcePaths is called', async () => {
    const tracker = Tracker();
    await removeEvent({
      getEventReference: tracker('getEventReference', {
        sourcePaths: [ [71413881], [54674789] ],
        aggregated: true
      }),
      updateSourcePaths: tracker('updateSourcePaths'),
      unreferenceEvent: tracker('unreferenceEvent', { success: true })
    }, {
      aggregatorAgendaUid: 123,
      sourceAgendaUid: 71413881,
      eventUid: 1
    });

    tracker.calls.pop().name.should.equal('updateSourcePaths');
  });

  it('if reference shows that event was not added to aggregator agenda through aggregation, then updateSourcePaths event if source is last', async () => {
    const tracker = Tracker();
    await removeEvent({
      getEventReference: tracker('getEventReference', {
        sourcePaths: [ 71413881 ],
        aggregated: false
      }),
      updateSourcePaths: tracker('updateSourcePaths'),
      unreferenceEvent: tracker('unreferenceEvent', { success: true })
    }, {
      aggregatorAgendaUid: 123,
      sourceAgendaUid: 71413881,
      eventUid: 1
    });

    tracker.calls.pop().name.should.equal('updateSourcePaths');
  });

  it('if unreference fails, result provides success bool at false and errors', async () => {
    const tracker = Tracker();
    const result = await removeEvent({
      getEventReference: tracker('getEventReference', {
        sourceAgendaUid: [ 71413881 ],
        aggregated: true
      }),
      unsetSourceUidOnExistingReference: tracker('unsetSourceUidOnExistingReference'),
      unreferenceEvent: tracker('unreferenceEvent', { success: false, errors: ['error1'] })
    }, {
      aggregatorAgendaUid: 123,
      sourceAgendaUid: 71413881,
      eventUid: 1
    });

    result.should.eql({ success: false, errors: ['error1'] });
  });

});
