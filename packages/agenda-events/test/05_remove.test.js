'use strict';

const _ = require('lodash');
const ih = require('immutability-helper');
const redis = require('redis');

const Queues = require('@openagenda/queues');

const Service = require('..');
const config = require('../testconfig');
const fixtures = require('./fixtures');

describe.only('agendaEvents - 05 - functional (server): remove', function() {
  let svc;
  let redisClient;

  beforeEach(async () => {
    await fixtures(config.mysql, [
      'reset.sql',
      '../../model.sql',
      'agenda_event.data.sql'
   ]);
  });

  beforeAll(async () => {
    redisClient = redis.createClient({
      socket: { host: 'localhost', port: 6379 }
    });

    await redisClient.connect();
  });

  beforeEach(() => {
    svc = Service(config);
  });

  it('simple remove', async () => {
    const before = await svc(62792452).get(10974548);
    const result = await svc(62792452).remove(10974548);
    const after = await svc(62792452).get(10974548);

    expect(result.success).toBe(true);

    expect(before).not.toBeNull();

    expect(after).toBeNull();

    expect(_.pick(result.removed, ['eventUid', 'agendaUid'])).toEqual({
      eventUid: 10974548,
      agendaUid: 62792452
    });
  });


  it('remove by legacyId', async () => {
    const before = await svc(62792452).get(10974548);
    const result = await svc.remove.byLegacyId(42, 24);
    const after = await svc(62792452).get(10974548);

    expect(result.success).toBe(true);
    expect(before).not.toBeNull();
    expect(after).toBeNull();
  });


  it('remove by legacyId with eventId only', async () => {
    const before = await svc(62792452).get(10974548);
    const result = await svc.remove.byLegacyId(null, 24);
    const after = await svc(62792452).get(10974548);

    expect(result.success).toBe(true);
    expect(before).not.toBeNull();
    expect(after).toBeNull();
  });


  it('all references of given event can be removed in one call', async () => {
    const result = await svc.remove(15205357);

    expect(result).toEqual({
      success: true,
      removed: 2
    });
  });


  it('when several references are removed', done => {
    let count = 0;

    const queue = Queues({
      redis: redisClient,
      prefix: 'agenda-events'
    })('05_remove')

    const svc = Service({
      ...config,
      queue,
      interfaces: {
        onRemove: (removed, context) => {
          count++;

          expect(removed.eventUid).toEqual(15205357);

          if (count === 2) {
            done();
          }
        }
      }
    });
    
    svc.remove(15205357);

    queue.run();
  });


  it('context can be passed in options to be transfered to onRemove interface', done => {
    const svc = Service(ih(config, {
      interfaces: {
        onRemove: {
          $set: (removed, context) => {
            expect(context.userUid).toEqual(111);

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
