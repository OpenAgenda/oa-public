import _ from 'lodash';
import Redis from 'ioredis';
import * as mw from '../middleware.js';
import testconfig from '../testconfig.js';
import service from '../service/index.js';
import setup from './fixtures/setup.js';

describe('keys - middleware', () => {
  let knex;
  let redisClient;

  beforeAll(async () => {
    knex = await setup({
      mysql: testconfig.mysql,
      schemas: testconfig.schemas,
      data: [`${import.meta.dirname}/fixtures/key.data.sql`],
    });

    redisClient = new Redis(testconfig.redis.connection);

    await service.init({
      ...testconfig,
      redis: { ...testconfig.redis, client: redisClient },
      knex,
    });
  });

  afterAll(async () => {
    redisClient.disconnect();
    await knex.destroy();
  });

  afterEach(async () => {
    const { prefix } = testconfig.redis;

    for (const key of await redisClient.keys(`${prefix}*`)) {
      await redisClient.del(key);
    }
  });

  it('create successfully', async () => {
    const req = {
      identifiers: { type: 'userPublic', identifier: 98596586 },
      body: { label: 'Ma première clé #ému' },
    };

    await new Promise((resolve, reject) => {
      mw.create()(req, {}, (err) => {
        if (err) return reject(err);

        expect(_.omit(req.result, ['key', 'createdAt'])).toEqual({
          id: 3,
          type: 'userPublic',
          identifier: 98596586,
          label: 'Ma première clé #ému',
        });

        resolve();
      });
    });
  });

  it('create which fail the validation', async () => {
    const req = {
      identifiers: { type: 'userPublic', identifier: 98596585 },
      body: { label: {} },
    };

    await new Promise((resolve) => {
      mw.create()(req, {}, (err) => {
        expect(err).toEqual({
          code: 400,
          json: {
            errors: [
              {
                field: 'label',
                code: 'string.invalidtype',
                message: 'not a string',
                origin: {},
              },
            ],
          },
        });

        resolve();
      });
    });
  });

  it('get', async () => {
    const req = {
      identifiers: 1,
    };

    await new Promise((resolve, reject) => {
      mw.get()(req, {}, (err) => {
        if (err) return reject(err);

        expect(_.omit(req.result, ['key', 'createdAt'])).toEqual({
          id: 1,
          type: 'userPublic',
          identifier: 98596585,
          label: 'Vielle clé !',
        });

        resolve();
      });
    });
  });

  it('get by key', async () => {
    const req = {
      identifiers: {
        type: 'userPublic',
        identifier: 98596585,
        key: '2733c8183cca49dcbfbaefd6c957f5b6',
      },
    };

    await new Promise((resolve, reject) => {
      mw.get()(req, {}, (err) => {
        if (err) return reject(err);

        expect(_.omit(req.result, ['key', 'createdAt'])).toEqual({
          id: 2,
          type: 'userPublic',
          identifier: 98596585,
          label: null,
        });

        resolve();
      });
    });
  });

  it('get which fail the validation', async () => {
    const req = {
      identifiers: { type: 'userPublic', identifier: 98596585, key: {} },
    };

    await new Promise((resolve) => {
      mw.get()(req, {}, (err) => {
        expect(err).toEqual({
          code: 400,
          json: {
            errors: [
              {
                field: 'key',
                code: 'string.invalidtype',
                message: 'not a string',
                origin: {},
              },
            ],
          },
        });

        resolve();
      });
    });
  });

  it('simple list', async () => {
    const req = {
      identifiers: { type: 'userPublic', identifier: 98596585 },
    };

    await new Promise((resolve, reject) => {
      mw.list()(req, {}, (err) => {
        if (err) return reject(err);

        expect(
          req.result.items.map((v) => _.omit(v, 'key', 'createdAt')),
        ).toEqual([
          {
            id: 1,
            type: 'userPublic',
            identifier: 98596585,
            label: 'Vielle clé !',
          },
          {
            id: 2,
            type: 'userPublic',
            identifier: 98596585,
            label: null,
          },
        ]);

        resolve();
      });
    });
  });

  it('list an offset and a limit', async () => {
    const req = {
      identifiers: { type: 'userPublic', identifier: 98596585 },
      query: { offset: 1, limit: 1 },
    };

    await new Promise((resolve, reject) => {
      mw.list()(req, {}, (err) => {
        if (err) return reject(err);

        expect(
          req.result.items.map((v) => _.omit(v, 'key', 'createdAt')),
        ).toEqual([
          {
            id: 2,
            type: 'userPublic',
            identifier: 98596585,
            label: null,
          },
        ]);

        resolve();
      });
    });
  });

  it('list gives total', async () => {
    const req = {
      identifiers: { type: 'userPublic', identifier: 98596585 },
      options: { total: true },
    };

    await new Promise((resolve, reject) => {
      mw.list()(req, {}, (err) => {
        if (err) return reject(err);

        expect(req.result.total).toBe(2);
        expect(
          req.result.items.map((v) => _.omit(v, 'key', 'createdAt')),
        ).toEqual([
          {
            id: 1,
            type: 'userPublic',
            identifier: 98596585,
            label: 'Vielle clé !',
          },
          {
            id: 2,
            type: 'userPublic',
            identifier: 98596585,
            label: null,
          },
        ]);

        resolve();
      });
    });
  });

  it('update by id', async () => {
    const req = {
      identifiers: 1,
      body: { label: 'The key of dead' },
    };

    await new Promise((resolve, reject) => {
      mw.update()(req, {}, (err) => {
        if (err) return reject(err);

        expect(_.omit(req.result, ['key', 'createdAt'])).toEqual({
          id: 1,
          type: 'userPublic',
          identifier: 98596585,
          label: 'The key of dead',
        });

        resolve();
      });
    });
  });

  it('update a label of key by key', async () => {
    const req = {
      identifiers: {
        type: 'userPublic',
        identifier: 98596585,
        key: '2733c8183cca49dcbfbaefd6c957f5b6',
      },
      body: { label: 'Clé' },
    };

    await new Promise((resolve, reject) => {
      mw.update()(req, {}, (err) => {
        if (err) return reject(err);

        expect(_.omit(req.result, ['key', 'createdAt'])).toEqual({
          id: 2,
          type: 'userPublic',
          identifier: 98596585,
          label: 'Clé',
        });

        resolve();
      });
    });
  });

  it('remove a key by his id', async () => {
    const req = {
      identifiers: 1,
    };

    await new Promise((resolve, reject) => {
      mw.remove()(req, {}, (err) => {
        if (err) return reject(err);

        expect(req.result).toBe(1);

        resolve();
      });
    });
  });

  it('remove a key', async () => {
    const req = {
      identifiers: {
        type: 'userPublic',
        identifier: 98596585,
        key: '2733c8183cca49dcbfbaefd6c957f5b6',
      },
    };

    await new Promise((resolve, reject) => {
      mw.remove()(req, {}, (err) => {
        if (err) return reject(err);

        expect(req.result).toBe(1);

        resolve();
      });
    });
  });
});
