'use strict';

const redis = require('redis');
const queues = require('..');

describe('instance version', () => {
  let q;
  let redisCli;

  beforeEach(async () => {
    redisCli = redis.createClient({
      host: 'localhost',
      port: 6379,
    });

    await redisCli.connect();

    const v2Queues = queues({ redis: redisCli, prefix: 'v2q:' });

    q = v2Queues('02_instance_version');
  });

  afterEach(async () => {
    await q.stop();
    await q.clear();

    await redisCli.quit();
  });

  it('instance queues up what it is given', async () => {
    await q('doThing', 1, 2, 3);

    expect(await q.len()).toBe(1);

    expect(await redisCli.lPop('v2q:02_instance_version')).toBe(
      '{"method":"doThing","args":[1,2,3]}',
    );
  });

  it('registered function matching queued name are called when queue is run', async () => {
    await new Promise((resolve) => {
      function doOtherThing(one, two, three) {
        expect(one).toBe(1);
        expect(two).toBe(2);
        expect(three).toBe(3);

        resolve();
      }

      q.register({ doOtherThing });

      q.run();

      q('doOtherThing', 1, 2, 3);
    });
  });

  it('if no matching function corresponds to queued emthod, it is discarded', async () => {
    await new Promise((resolve) => {
      q.run();

      q.on('error', (method, args, error) => {
        expect(error.message).toBe('Unregistered method: doUnkownThing');

        resolve();
      });

      q('doUnkownThing', 1);
    });
  });

  it('a method throwing an exception does not interrupt queue processing', async () => {
    await new Promise((resolve) => {
      function throwsError() {
        throw new Error('Oh nos!');
      }

      function doesThings(message) {
        expect(message).toBe('ok');

        resolve();
      }

      q.register({ throwsError, doesThings });

      q.run();

      q('throwsErrors');

      q('doesThings', 'ok');
    });
  });
});
