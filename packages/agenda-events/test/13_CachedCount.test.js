import Redis from 'ioredis';
import CachedCount from '../service/lib/CachedCount.js';

describe('agendaEvents - 13 - unit (server): CachedCount', () => {
  let redisClient;
  let cache;

  beforeAll(async () => {
    redisClient = new Redis({
      host: 'localhost',
      port: 6379,
    });

    cache = CachedCount(redisClient, 'ns', (_arg) => 123, 1);
  });

  afterEach(async () => {
    await redisClient.del('agenda_events:CachedCount:ns:889798');
  });

  afterAll(() => redisClient.quit());

  it('increments by one', async () => {
    const count = await cache.inc(889798, 1);
    expect(count).toBe(124);
  });

  it('clears after provided lifetime', () =>
    new Promise((rs) => {
      setTimeout(() => {
        redisClient
          .get('agenda_events:CachedCount:ns:889798')
          .then((result) => {
            expect(result).toBeNull();
            rs();
          });
      }, 1010);
    }));

  it('increments by two', async () => {
    const count = await cache.inc(889798, 2);
    expect(count).toBe(125);
  });

  it('decrements by two', async () => {
    const count = await cache.dec(889798, 2);
    expect(count).toBe(121);
  });

  it('loads value from function on first execution, from cached on second', async () => {
    let callCount = 0;
    const otherCache = CachedCount(
      redisClient,
      'ns',
      (_arg) => {
        callCount += 1;
        return 42;
      },
      1,
    );

    const firstCallResult = await otherCache(889798);
    const secondCallResult = await otherCache(889798);

    expect(callCount).toBe(1);
    expect(firstCallResult).toBe(42);
    expect(secondCallResult).toBe(42);
  });
});
