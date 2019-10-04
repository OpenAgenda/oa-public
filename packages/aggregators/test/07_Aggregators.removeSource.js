'use strict';

const should = require('should');

const removeSource = require('../Aggregators/lib/removeSource');
const loadSourceRemoves = require('../Aggregators/lib/loadSourceRemoves');

const {
  asAsync,
  Tracker,
  getJSON
} = require('./utils');

describe('Aggregators removeSource', () => {

  describe('removeSource', () => {

    const tracker = Tracker();

    const aggregatorAgenda = getJSON('fixtures/removeSource/aggregatorAgenda');
    const sourceAgenda = getJSON('fixtures/removeSource/sourceAgenda');

    let removeSourceWasCalled = false;
    let enqueuePayLoad = {};

    before(async () => {
      await removeSource({
        isAgendaSource: tracker('isAgendaSource', true),
        removeSourceEntry: tracker('removeSourceEntry'),
        enqueueLoadSourceRemoves: tracker('enqueueLoadSourceRemoves')
      }, aggregatorAgenda, sourceAgenda);
    });

    it('verifies if agenda is source first', () => {
      tracker.calls[0].name.should.equal('isAgendaSource');
    });

    it('if agenda is source, calls fn to remove source, providing aggregator and source agendas', () => {
      tracker.calls[1].name.should.equal('removeSourceEntry');
      tracker.calls[1].args[0].should.equal(aggregatorAgenda);
      tracker.calls[1].args[1].should.equal(sourceAgenda);
    });

    it('calls enqueueing function last, providing uids of aggregator and source agendas', () => {
      tracker.calls[2].name.should.equal('enqueueLoadSourceRemoves');
      tracker.calls[2].args[0].should.eql({
        aggregatorAgendaUid: aggregatorAgenda.uid,
        sourceAgendaUid: sourceAgenda.uid
      });
    });

  });

  describe('loadSourceRemoves', () => {
    const tracker = Tracker();
    let loops = 0;

    before(async () => {
      await loadSourceRemoves({
        listEventReferences: tracker(
          'listEventReferences',
          () =>  getJSON(`fixtures/removeSource/listEventReferences${loops++ > 0?'Empty':''}`)
        ),
        enqueueRemove: tracker('enqueueRemove')
      }, 123, 456);
    });

    it('calls listEventReferences first to list events of source to evaluate on aggregator', () => {
      tracker.calls[0].name.should.equal('listEventReferences');
    });

    it('enqueueRemove is called for each event', () => {
      tracker.calls.slice(1, 21).filter(c => c.name === 'enqueueRemove').length.should.equal(20);
    });
  });

});
