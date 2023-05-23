'use strict';

const should = require('should');
const redis = require('redis');

const CachedCount = require('../service/lib/CachedCount');

describe('agendaEvents - 13 - unit (server): CachedCount', () => {
  let redisClient, cache;

  before(async () => {
    redisClient = redis.createClient({
      host: 'localhost',
      port: 6379,
    });

    await redisClient.connect();

    cache = CachedCount(redisClient, 'ns', arg => 123, 1);
  });

  afterEach(async () => {
    await redisClient.del('agenda_events:CachedCount:ns:889798');
  });

  after(async () => await redisClient.quit());

  it('increments by one', async () => {
    const count = await cache.inc(889798, 1);
    count.should.equal(124);
  });

  it('clears after provided lifetime', done => {
    setTimeout(() => {
      redisClient.get('agenda_events:CachedCount:ns:889798').then(result => {
        should(result).equal(null);
        done();
      });
    }, 1010);
  });

  it('increments by two', async () => {
    const count = await cache.inc(889798, 2);
    count.should.equal(125);
  });

  it('decrements by two', async () => {
    const count = await cache.dec(889798, 2);
    count.should.equal(121);
  });

  it('loads value from function on first execution, from cached on second', async () => {
    let callCount = 0;
    const cache = CachedCount(redisClient, 'ns', arg => {
      callCount += 1;
      return 42;
    }, 1);

    const firstCallResult = await cache(889798);
    const secondCallResult = await cache(889798);

    callCount.should.equal(1)
    firstCallResult.should.equal(42);
    secondCallResult.should.equal(42);
  });

});
