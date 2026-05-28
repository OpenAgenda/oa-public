import { jest } from '@jest/globals';
import express from 'express';
import bodyParser from 'body-parser';
import request from 'supertest';
import plugApp from '../services/users/plugApp.js';

// Lightweight mount of the FULL users plugApp with stubbed services, exercising
// the D3b-user routes (`/users/me/api-keys`) in isolation: routing, the
// requireUserJson guard, delegation to the auth façade, and response shapes.
// The façade itself (apikey-store reads/writes) is integration-tested in
// @openagenda/auth (12_apiKey.test.js); here we only assert the HTTP wiring.
// The feathers/getHandler routes are mounted but never hit (different paths);
// `upload.middleware` is stubbed to a passthrough.
//
// `enableSecret` -> what `req.app.core.users.get(uid, {detailed:true}).store
//                   .enable_secret` resolves to (the SK-creation gate). Default
//                   `true` so the happy paths don't trip the guard; tests that
//                   want the 403 path pass false.
function buildApp({ user, auth, enableSecret = true } = {}) {
  const app = express();
  app.use(bodyParser.json());

  app.use((req, _res, next) => {
    if (user) req.user = user;
    next();
  });

  app.services = {
    users: { upload: { middleware: () => (_req, _res, next) => next() } },
    auth,
  };
  app.core = {
    users: {
      get: async () => ({
        uid: user?.uid,
        store: { enable_secret: enableSecret },
      }),
    },
  };

  plugApp(app); // registers its own `/users` error handler (verror → JSON)

  return app;
}

const USER = { uid: 42 };

describe('90 - unit - user api-keys endpoints (D3b-user)', () => {
  describe('guard', () => {
    it('requireUserJson: 401s an anonymous request (JSON, not a redirect)', async () => {
      const app = buildApp({ auth: {} });
      const res = await request(app).get('/users/me/api-keys');
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Not logged' });
    });
  });

  describe('list', () => {
    it('returns { items, total } from the façade, scoped to req.user.uid', async () => {
      const items = [{ id: 'k1', name: 'a', metadata: { oaKind: 'sk' } }];
      const listUserKeys = jest.fn().mockResolvedValue(items);
      const app = buildApp({ user: USER, auth: { listUserKeys } });

      const res = await request(app).get('/users/me/api-keys');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ items, total: 1 });
      expect(listUserKeys).toHaveBeenCalledWith(42);
    });
  });

  describe('create', () => {
    it('201s with the plaintext once + record (sk)', async () => {
      const created = { key: 'oa_sk_once', record: { id: 'k9', name: 'CLI' } };
      const createUserKey = jest.fn().mockResolvedValue(created);
      const app = buildApp({ user: USER, auth: { createUserKey } });

      const res = await request(app)
        .post('/users/me/api-keys')
        .send({ name: 'CLI', oaKind: 'sk' });

      expect(res.status).toBe(201);
      expect(res.body).toEqual(created);
      expect(createUserKey).toHaveBeenCalledWith(42, {
        oaKind: 'sk',
        name: 'CLI',
      });
    });

    it('400s when oaKind is absent, without calling the façade', async () => {
      const createUserKey = jest.fn();
      const app = buildApp({ user: USER, auth: { createUserKey } });

      const res = await request(app)
        .post('/users/me/api-keys')
        .send({ name: 'CLI' });

      expect(res.status).toBe(400);
      expect(createUserKey).not.toHaveBeenCalled();
    });

    it('passes an explicit oaKind (pk) through', async () => {
      const createUserKey = jest
        .fn()
        .mockResolvedValue({ key: 'x', record: {} });
      const app = buildApp({ user: USER, auth: { createUserKey } });

      await request(app)
        .post('/users/me/api-keys')
        .send({ name: 'widget', oaKind: 'pk' });

      expect(createUserKey).toHaveBeenCalledWith(42, {
        oaKind: 'pk',
        name: 'widget',
      });
    });

    it('400s an invalid oaKind without calling the façade', async () => {
      const createUserKey = jest.fn();
      const app = buildApp({ user: USER, auth: { createUserKey } });

      const res = await request(app)
        .post('/users/me/api-keys')
        .send({ oaKind: 'admin' });

      expect(res.status).toBe(400);
      expect(createUserKey).not.toHaveBeenCalled();
    });

    it('403s sk creation when the admin gate (store.enable_secret) is off', async () => {
      const createUserKey = jest.fn();
      const app = buildApp({
        user: USER,
        auth: { createUserKey },
        enableSecret: false,
      });

      const res = await request(app)
        .post('/users/me/api-keys')
        .send({ name: 'CLI', oaKind: 'sk' });

      expect(res.status).toBe(403);
      expect(createUserKey).not.toHaveBeenCalled();
    });

    it('does not consult the admin gate for pk creation', async () => {
      const createUserKey = jest
        .fn()
        .mockResolvedValue({ key: 'oa_pk_x', record: {} });
      const app = buildApp({
        user: USER,
        auth: { createUserKey },
        enableSecret: false, // off, but pk does not care
      });

      const res = await request(app)
        .post('/users/me/api-keys')
        .send({ name: 'widget', oaKind: 'pk' });

      expect(res.status).toBe(201);
      expect(createUserKey).toHaveBeenCalledWith(42, {
        oaKind: 'pk',
        name: 'widget',
      });
    });
  });

  describe('revoke', () => {
    it('200s { removed: true } when the façade removed a row', async () => {
      const revokeUserKey = jest.fn().mockResolvedValue(true);
      const app = buildApp({ user: USER, auth: { revokeUserKey } });

      const res = await request(app).delete('/users/me/api-keys/k1');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ removed: true });
      expect(revokeUserKey).toHaveBeenCalledWith(42, 'k1');
    });

    it("404s when the key is absent or not the user's", async () => {
      const revokeUserKey = jest.fn().mockResolvedValue(false);
      const app = buildApp({ user: USER, auth: { revokeUserKey } });

      const res = await request(app).delete('/users/me/api-keys/nope');

      expect(res.status).toBe(404);
      expect(revokeUserKey).toHaveBeenCalledWith(42, 'nope');
    });
  });

  describe('rename', () => {
    it('200s { record } from the façade, scoped to req.user.uid', async () => {
      const record = { id: 'k1', name: 'renamed', metadata: { oaKind: 'sk' } };
      const renameUserKey = jest.fn().mockResolvedValue(record);
      const app = buildApp({ user: USER, auth: { renameUserKey } });

      const res = await request(app)
        .patch('/users/me/api-keys/k1')
        .send({ name: 'renamed' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ record });
      expect(renameUserKey).toHaveBeenCalledWith(42, 'k1', 'renamed');
    });

    it("404s when the key is absent or not the user's", async () => {
      const renameUserKey = jest.fn().mockResolvedValue(null);
      const app = buildApp({ user: USER, auth: { renameUserKey } });

      const res = await request(app)
        .patch('/users/me/api-keys/nope')
        .send({ name: 'x' });

      expect(res.status).toBe(404);
      expect(renameUserKey).toHaveBeenCalledWith(42, 'nope', 'x');
    });

    it('400s when name is not a string, without calling the façade', async () => {
      const renameUserKey = jest.fn();
      const app = buildApp({ user: USER, auth: { renameUserKey } });

      const res = await request(app).patch('/users/me/api-keys/k1').send({});

      expect(res.status).toBe(400);
      expect(renameUserKey).not.toHaveBeenCalled();
    });
  });
});
