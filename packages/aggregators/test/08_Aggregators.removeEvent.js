'use strict';

const removeEvent = require('../lib/removeEvent');
const should = require('should');

const {
  asAsync,
  Tracker,
  getJSON
} = require('./utils');

describe('Aggregators removeEvent', () => {

  it('if reference shows add by aggregation and source is last source refered, unreferenceEvent is called', async () => {
    const tracker = Tracker();
    await removeEvent({
      getEventReference: tracker('getEventReference', {
        sourceAgendaUid: [ 71413881 ],
        aggregated: true
      }),
      unsetSourceUidOnExistingReference: tracker('unsetSourceUidOnExistingReference'),
      unreferenceEvent: tracker('unreferenceEvent', { success: true })
    }, {
      aggregatorAgendaUid: 123,
      sourceAgendaUid: 71413881,
      eventUid: 1
    });

    tracker.calls.pop().name.should.equal('unreferenceEvent');
  });

  it('if reference shows that other sources reference event, then unsetSourceUidOnExistingReference is called', async () => {
    const tracker = Tracker();
    await removeEvent({
      getEventReference: tracker('getEventReference', {
        sourceAgendaUid: [ 71413881, 54674789 ],
        aggregated: true
      }),
      unsetSourceUidOnExistingReference: tracker('unsetSourceUidOnExistingReference'),
      unreferenceEvent: tracker('unreferenceEvent', { success: true })
    }, {
      aggregatorAgendaUid: 123,
      sourceAgendaUid: 71413881,
      eventUid: 1
    });

    tracker.calls.pop().name.should.equal('unsetSourceUidOnExistingReference');
  });

  it('if reference shows that event was not added to aggregator agenda through aggregation, then unsetSourceUidOnExistingReference event if source is last', async () => {
    const tracker = Tracker();
    await removeEvent({
      getEventReference: tracker('getEventReference', {
        sourceAgendaUid: [ 71413881 ],
        aggregated: false
      }),
      unsetSourceUidOnExistingReference: tracker('unsetSourceUidOnExistingReference'),
      unreferenceEvent: tracker('unreferenceEvent', { success: true })
    }, {
      aggregatorAgendaUid: 123,
      sourceAgendaUid: 71413881,
      eventUid: 1
    });

    tracker.calls.pop().name.should.equal('unsetSourceUidOnExistingReference');
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
