'use strict';

const _ = require('lodash');
const ih = require('immutability-helper');
const should = require('should');

const Service = require('../');
const config = require('../testconfig');
const fixtures = require('./service/load');

describe('agendaEvents - 09 - functional (server): set', function() {
  let svc;

  before(async () => {
    await fixtures(config.mysql, [
      'reset.sql',
      'agenda_event.data.sql'
   ]);
  });

  before(() => {
    svc = Service(config);
  });

  it('set can create', async () => {
    const ae = await svc(1234).get(5678);

    should(ae).equal(null);

    await svc(1234).set(5678);

    const created = await svc(1234).get(5678);

    _.pick(created, ['agendaUid', 'eventUid']).should.eql({
      agendaUid: 1234,
      eventUid: 5678
    });
  });

  it('set can update', async () => {
    const ae = await svc(1234).create(9999);

    ae.created.state.should.equal(2);

    await svc(1234).set(9999, { state: 1 });

    const updated = await svc(1234).get(9999);

    _.pick(updated, ['agendaUid', 'eventUid']).should.eql({
      agendaUid: 1234,
      eventUid: 9999
    });
  });


  it('set can take operation-specific options', async () => {
    await svc(1234).set(38473, { state: 1, create: {
      state: 2
    } });

    const ae = await svc(1234).get(38473);

    ae.state.should.equal(2);
  });


  it('set item is returned in set key of result', async () => {
    const result = await svc(1234).set(9999, { state: 0 });

    _.pick(result.set, ['agendaUid', 'eventUid']).should.eql({
      agendaUid: 1234,
      eventUid: 9999
    });
  });

});
