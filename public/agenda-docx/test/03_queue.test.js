const queue = require('../server/queue');

describe('unit - queue', () => {
  describe('init', () => {
    test('redis availability is tested at init', async () => {
      await expect(
        queue.init({
          namespace: 'testoadocx',
          redis: {
            port: 6389,
            host: 'localhost',
          },
        })
      ).rejects.toMatchObject({
        jse_shortmsg: 'oa-docx init - Could not connect to redis',
      });
    });
  });

  describe('queue operations', () => {
    beforeAll(async () => {
      await queue.init({
        namespace: 'testoadocx',
        redis: {
          port: 6379,
          host: 'localhost',
        },
      });
    });

    beforeEach(async () => {
      await queue.clear();
    });

    test('queue and pop queue', async () => {
      expect(await queue.total()).toEqual(0);

      await queue({ uid: 123, data: 'oui?' });

      expect(await queue.total()).toEqual(1);

      expect(await queue.pop()).toEqual({ uid: 123, data: 'oui?' });
    });

    test('wait for queue', async () => new Promise(cb => {
      // nothing has been queued at time of call
      queue.waitAndPop().then(data => {
        expect(data).toEqual({ et: 'bim' });

        cb();
      });

      queue({ et: 'bim' });
    }));
  });
});
