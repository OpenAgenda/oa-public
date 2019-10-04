'use strict';

const remove = require('../Aggregators/lib/remove');
const should = require('should');

const {
  asAsync,
  Tracker,
  getJSON
} = require('./utils');

describe('Aggregators remove', () => {

  it('if reference shows add by aggregation and source is last source refered, unreferenceEvent is called', async () => {
    const tracker = Tracker();
    await remove({
      getEventReference: tracker('getEventReference', {
        sourceAgendaUid: [ 71413881 ],
        aggregated: true
      }),
      unsetSourceUidOnExistingReference: tracker('unsetSourceUidOnExistingReference'),
      unreferenceEvent: tracker('unreferenceEvent')
    }, {
      aggregatorAgendaUid: 123,
      sourceAgendaUid: 71413881
    });

    tracker.calls.pop().name.should.equal('unreferenceEvent');
  });

  it('if reference shows that other sources reference event, then unsetSourceUidOnExistingReference is called', async () => {
    const tracker = Tracker();
    await remove({
      getEventReference: tracker('getEventReference', {
        sourceAgendaUid: [ 71413881, 54674789 ],
        aggregated: true
      }),
      unsetSourceUidOnExistingReference: tracker('unsetSourceUidOnExistingReference'),
      unreferenceEvent: tracker('unreferenceEvent')
    }, {
      aggregatorAgendaUid: 123,
      sourceAgendaUid: 71413881
    });

    tracker.calls.pop().name.should.equal('unsetSourceUidOnExistingReference');
  });

  it('if reference shows that event was not added to aggregator agenda through aggregation, then unsetSourceUidOnExistingReference event if source is last', async () => {
    const tracker = Tracker();
    await remove({
      getEventReference: tracker('getEventReference', {
        sourceAgendaUid: [ 71413881 ],
        aggregated: false
      }),
      unsetSourceUidOnExistingReference: tracker('unsetSourceUidOnExistingReference'),
      unreferenceEvent: tracker('unreferenceEvent')
    }, {
      aggregatorAgendaUid: 123,
      sourceAgendaUid: 71413881
    });

    tracker.calls.pop().name.should.equal('unsetSourceUidOnExistingReference');
  });

});
