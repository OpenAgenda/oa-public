'use strict';

const _ = require('lodash');
const ih = require('immutability-helper');
const should = require('should');

const queue = require('@openagenda/queue');

const Service = require('../');
const config = require('../testconfig');
const fixtures = require('./service/load');

describe('agendaEvents - functional (server): remove', function() {
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

  beforeEach(done => {
    queue('agendaEventInterfaces', { redis: config.redis }).test.clear(done);
  });

  it('simple remove', async () => {
    const before = await svc(62792452).get(10974548);
    const result = await svc(62792452).remove(10974548);
    const after = await svc(62792452).get(10974548);

    result.success.should.equal(true);

    before.should.not.equal(null);

    should(after).equal(null);

    _.pick(result.removed, ['eventUid', 'agendaUid']).should.eql({
      eventUid: 10974548,
      agendaUid: 62792452
    });
  });


  it('remove by legacyId', async () => {
    const before = await svc(62792452).get(10974548);
    const result = await remove.byLegacyId(42, 24);
    const after = await svc(62792452).get(10974548);

    result.success.should.equal(true);
    before.should.not.equal(null);
    should(after).equal(null);
  });


  it('remove by legacyId with eventId only', async () => {
    const before = await svc(62792452).get(10974548);
    const result = await remove.byLegacyId(null, 24);
    const after = await svc(62792452).get(10974548);

    result.success.should.equal(true);
    before.should.not.equal(null);
    should(after).equal(null);
  });


  it('all references of given event can be removed in one call', async () => {
    const result = await svc.remove(15205357);

    result.should.eql({
      success: true,
      removed: 2
    });
  });


  it('when several references are removed', done => {
    let count = 0;

    svc.init(im(config, {
      interfaces: {
        onRemove: {
          $set: (removed, context) => {
            count++;

            removed.eventUid.should.equal(15205357);

            if (count === 2) {
              done();
            }
          }
        }
      }
    }));

    svc.remove(15205357);

    svc.tasks.interfaces();
  });


  it('context can be passed in options to be transfered to onRemove interface', done => {
    svc = Service(ih(config, {
      interfaces: {
        onRemove: {
          $set: (removed, context) => {

            context.should.eql({
              userUid: 111,
              agendaUid: null,
              agenda: null,
              event: null,
              aggregated: false,
              sourceAgenda: null,
              transferToLegacy: false,
              legacy: true,
              deletion: false,
              batched: false
            });

            done();

          }
        }
      }
    }));

    svc(62792452).remove(10974548, {
      context: {
        userUid: 111
      }
    });

  });

});
